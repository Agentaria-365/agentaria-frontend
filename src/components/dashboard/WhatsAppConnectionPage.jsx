import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';

const WhatsAppConnectionPage = () => {
  const [connectionStatus, setConnectionStatus] = useState('checking'); // checking, disconnected, connecting, connected
  const [qrCode, setQrCode] = useState(null);
  const [connectionMethod, setConnectionMethod] = useState('qr');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [instanceDetails, setInstanceDetails] = useState(null);
  const [userId, setUserId] = useState(null);

  const N8N_WEBHOOKS = {
    initConnection: 'https://n8n.srv1192286.hstgr.cloud/webhook/whatsapp/init',
    validateConnection: 'https://n8n.srv1192286.hstgr.cloud/webhook/stop_qr',
    disconnect: 'https://n8n.srv1192286.hstgr.cloud/webhook/whatsapp/disconnect' // Updated per snippet
  };

  // ✅ 1. Check Existing Connection on Page Load (Logic from Claude)
  useEffect(() => {
    const checkExistingConnection = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setConnectionStatus('disconnected');
        return;
      }

      setUserId(user.id);

      // Fetch from subscribers details table
      const { data, error } = await supabase
        .from('subscribers details')
        .select('instance_name, instance_status, service_number')
        .eq('subscriber_id', user.id) // Note: Using 'subscriber_id' to match your DB column name
        .single();

      if (error || !data) {
        setConnectionStatus('disconnected');
        return;
      }

      // Check if already connected (assuming 'active' or 'open' means connected)
      // Claude's snippet checked for 'open', I added 'active' just in case you stored it that way
      if ((data.instance_status === 'open' || data.instance_status === 'active') && data.instance_name) {
        setConnectionStatus('connected');
        setInstanceDetails({
          phone_number: data.service_number || 'Connected',
          connected_at: new Date().toISOString()
        });
      } else {
        setConnectionStatus('disconnected');
      }
    };

    checkExistingConnection();
  }, []);

  const initiateConnection = async () => {
    if (!userId) {
      setError('User not identified. Please reload.');
      return;
    }

    setLoading(true);
    setError('');
    setQrCode(null);

    try {
      const response = await fetch(N8N_WEBHOOKS.initConnection, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriber_id: userId,
          connection_method: connectionMethod
        })
      });

      if (!response.ok) throw new Error('Failed to initialize connection');

      const data = await response.json();
      
      if (data.qr_code) {
        const cleanQR = data.qr_code.replace('data:image/png;base64,', '');
        setQrCode(cleanQR);
        setConnectionStatus('connecting');
        
        startValidationProcess();
      } else {
        setError('Could not fetch QR code. Please try again.');
      }

    } catch (err) {
      setError('Failed to start connection. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startValidationProcess = async () => {
    try {
      const response = await fetch(N8N_WEBHOOKS.validateConnection, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriber_id: userId
        })
      });

      const result = await response.json();

      if (result.status === 'connected') {
        // ✅ Update local state
        setConnectionStatus('connected');
        setQrCode(null);
        setInstanceDetails({
          phone_number: result.phone || 'Connected',
          connected_at: new Date().toISOString()
        });
      } 
      else if (result.status === 'error' && result.message === 'WRONG_NUMBER') {
        setConnectionStatus('disconnected');
        setQrCode(null);
        setError('❌ Access Denied: You connected a different number. Please connect ONLY your registered Service Number.');
      } 
      else {
        setConnectionStatus('disconnected');
        setQrCode(null);
        setError('Connection timed out or failed. Please try again.');
      }

    } catch (err) {
      console.error("Validation error:", err);
      setConnectionStatus('disconnected');
      setQrCode(null);
    }
  };

  const handleDisconnect = async () => {
    // ✅ Confirmation Dialog with actual phone number
    const phoneNumber = instanceDetails?.phone_number || 'your WhatsApp number';
    
    if (!confirm(`Are you sure you want to disconnect ${phoneNumber} from Agentaria?\n\n⚠️ This will stop all automated responses immediately.\n\nClick OK to disconnect, or Cancel to keep it connected.`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(N8N_WEBHOOKS.disconnect, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subscriber_id: userId 
        })
      });

      if (!response.ok) throw new Error('Failed to disconnect');

      const result = await response.json();

      if (result.status === 'disconnected') {
        // ✅ Success
        setConnectionStatus('disconnected');
        setInstanceDetails(null);
        setQrCode(null);
        alert('✅ WhatsApp disconnected successfully!');
      } else {
        throw new Error('Unexpected response from server');
      }

    } catch (err) {
      setError('Failed to disconnect. Please try again or contact support.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    alert('Phone connection flow - Coming soon');
  };

  // ✅ Show loading while checking (Initial State)
  if (connectionStatus === 'checking') {
    return (
      <div className="max-w-[900px] mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38F28D] mx-auto mb-4"></div>
          <p className="text-[#A7B0AD]">Checking connection status...</p>
        </div>
      </div>
    );
  }

  // ✅ Main Return
  return (
    <div className="max-w-[900px] mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">WhatsApp Connection</h1>
        <p className="text-[#A7B0AD] text-lg">
          Connect your WhatsApp number to activate Agentaria
        </p>
      </div>

      {/* Connection Status Card - CONNECTED */}
      {connectionStatus === 'connected' && instanceDetails && (
        <div className="bg-[#0D1211] border border-[#38F28D]/30 rounded-[18px] p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#38F28D]/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#38F28D]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Connected</h3>
                <p className="text-[#A7B0AD] mb-2">
                  {instanceDetails.phone_number || 'WhatsApp Business'}
                </p>
                <div className="flex items-center gap-4 text-sm text-[#A7B0AD]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#38F28D] rounded-full animate-pulse"></div>
                    <span>Active</span>
                  </div>
                  <span>•</span>
                  <span>Connected on {new Date(instanceDetails.connected_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="px-4 py-2 border border-red-500/30 text-red-400 rounded-[12px] hover:bg-red-500/10 transition-all duration-300 disabled:opacity-50"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Main Connection Card */}
      <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-8">
        {connectionStatus === 'disconnected' && (
          <>
            <h2 className="text-2xl font-bold mb-6">Choose Connection Method</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setConnectionMethod('qr')}
                className={`p-6 rounded-[14px] border-2 transition-all duration-300 text-left ${
                  connectionMethod === 'qr'
                    ? 'border-[#38F28D] bg-[#38F28D]/5'
                    : 'border-[#1A2321] hover:border-[#38F28D]/30'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#38F28D]/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#38F28D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg">QR Code</h3>
                </div>
                <p className="text-sm text-[#A7B0AD]">Scan with WhatsApp mobile app.</p>
              </button>

              <button
                onClick={() => setConnectionMethod('phone')}
                className={`p-6 rounded-[14px] border-2 transition-all duration-300 text-left ${
                  connectionMethod === 'phone'
                    ? 'border-[#38F28D] bg-[#38F28D]/5'
                    : 'border-[#1A2321] hover:border-[#38F28D]/30'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#38F28D]/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#38F28D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg">Phone Number</h3>
                </div>
                <p className="text-sm text-[#A7B0AD]">Receive verification code.</p>
              </button>
            </div>

            {/* QR Code Instructions & Button - RESTORED */}
            {connectionMethod === 'qr' && (
              <div>
                <div className="bg-[#070A0A] rounded-[14px] p-6 mb-6">
                  <h3 className="font-semibold mb-4">How to connect:</h3>
                  <ol className="space-y-3 text-sm text-[#A7B0AD]">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#38F28D] text-[#070A0A] rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      <span>Open WhatsApp on your phone</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#38F28D] text-[#070A0A] rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      <span>Tap Menu or Settings and select Linked Devices</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#38F28D] text-[#070A0A] rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      <span>Tap on Link a Device</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#38F28D] text-[#070A0A] rounded-full flex items-center justify-center text-xs font-bold">4</span>
                      <span>Point your phone at this screen to scan the QR code</span>
                    </li>
                  </ol>
                </div>

                <button
                  onClick={initiateConnection}
                  disabled={loading}
                  className="w-full bg-[#38F28D] text-[#070A0A] py-4 rounded-[14px] font-semibold hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(56,242,141,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating QR Code...' : 'Generate QR Code'}
                </button>
              </div>
            )}

            {/* Phone Form (Placeholder) */}
            {connectionMethod === 'phone' && (
              <form onSubmit={handlePhoneSubmit}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 focus:border-[#38F28D] focus:outline-none transition-colors"
                      placeholder="+1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Verification Code</label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 focus:border-[#38F28D] focus:outline-none transition-colors"
                      placeholder="6-digit code"
                    />
                  </div>
                </div>
                 <button type="submit" className="w-full bg-[#38F28D] text-[#070A0A] py-4 rounded-[14px] font-bold">Connect</button>
              </form>
            )}
          </>
        )}

        {/* Connecting State - Show QR Code */}
        {connectionStatus === 'connecting' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Scan QR Code</h2>
            
            {qrCode ? (
              <div className="bg-white p-6 rounded-[18px] inline-block mb-6 relative group">
                <img
                  src={`data:image/png;base64,${qrCode}`}
                  alt="WhatsApp QR Code"
                  className="w-64 h-64"
                />
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/0 transition-all"></div>
              </div>
            ) : (
               <div className="bg-[#070A0A] p-6 rounded-[18px] inline-block mb-6 w-64 h-64 flex items-center justify-center border border-[#1A2321]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38F28D]"></div>
               </div>
            )}

            <div className="flex flex-col items-center justify-center gap-3 text-[#A7B0AD] mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#38F28D] rounded-full animate-pulse"></div>
                <span>Waiting for scan...</span>
              </div>
              {/* Expiry Warning Text */}
              <p className="text-sm text-yellow-500/80 bg-yellow-500/10 px-3 py-1 rounded-full">
                ⚠️ This QR code will expire in 1 minute
              </p>
            </div>

            <button
              onClick={() => {
                setConnectionStatus('disconnected');
                setQrCode(null);
              }}
              className="text-[#A7B0AD] hover:text-[#F2F5F4] underline"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-[12px] p-4 text-red-400 text-center">
            {error}
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-[#0D1211] border border-[#1A2321] rounded-[14px] p-6">
          <h3 className="font-bold mb-3">⚡ Instant Activation</h3>
          <p className="text-sm text-[#A7B0AD] leading-relaxed">
            Once connected, Agentaria starts handling messages immediately. No additional setup required.
          </p>
        </div>

        <div className="bg-[#0D1211] border border-[#1A2321] rounded-[14px] p-6">
          <h3 className="font-bold mb-3">🔒 Secure Connection</h3>
          <p className="text-sm text-[#A7B0AD] leading-relaxed">
            Your WhatsApp data is encrypted end-to-end. We never store your messages or contacts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConnectionPage;