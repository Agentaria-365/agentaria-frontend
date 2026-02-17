import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';

const WhatsAppConnectionPage = () => {
  // ==============================
  // 1. STATE MANAGEMENT
  // ==============================
  const [connectionStatus, setConnectionStatus] = useState('checking'); // checking, disconnected, connecting, connected
  const [qrCode, setQrCode] = useState(null);
  const [pairingCode, setPairingCode] = useState(null); // Code store karne k liye
  const [connectionMethod, setConnectionMethod] = useState('qr'); // 'qr' or 'phone'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [instanceDetails, setInstanceDetails] = useState(null);
  const [userId, setUserId] = useState(null);

  // ==============================
  // 2. WEBHOOK CONFIGURATION
  // ==============================
  const N8N_WEBHOOKS = {
    initConnection: 'https://n8n.srv1192286.hstgr.cloud/webhook/whatsapp/init',
    validateConnection: 'https://n8n.srv1192286.hstgr.cloud/webhook/stop_qr', // Long polling logic (waits 15s-1m)
    disconnect: 'https://n8n.srv1192286.hstgr.cloud/webhook/whatsapp/disconnect',
    phoneCode: 'https://n8n.srv1192286.hstgr.cloud/webhook/code' // ✅ Correct Webhook for Phone Code
  };

  // ==============================
  // 3. INITIAL CHECK (ON LOAD)
  // ==============================
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setConnectionStatus('disconnected');
          return;
        }
        setUserId(user.id);

        const { data, error } = await supabase
          .from('subscribers details')
          .select('instance_name, instance_status, service_number')
          .eq('subscriber_id', user.id)
          .single();

        if (error || !data) {
          setConnectionStatus('disconnected');
          return;
        }

        // Logic: Agar instance 'open' ya 'active' hai to Connected show karo
        if ((data.instance_status === 'open' || data.instance_status === 'active') && data.instance_name) {
          setConnectionStatus('connected');
          setInstanceDetails({
            phone_number: data.service_number || 'Connected',
            connected_at: new Date().toISOString()
          });
        } else {
          setConnectionStatus('disconnected');
        }
      } catch (err) {
        console.error("Auth Check Error:", err);
        setConnectionStatus('disconnected');
      }
    };

    checkExistingConnection();
  }, []);

  // ==============================
  // 4. INITIATE CONNECTION (Action Handler)
  // ==============================
  const initiateConnection = async (e) => {
    if (e) e.preventDefault();
    
    if (!userId) {
      setError('User not identified. Please reload the page.');
      return;
    }

    setLoading(true);
    setError('');
    setQrCode(null);
    setPairingCode(null);

    try {
      // -----------------------------
      // CASE A: PHONE NUMBER FLOW
      // -----------------------------
      if (connectionMethod === 'phone') {
        if (!phoneNumber || phoneNumber.length < 5) {
            setError('Please enter a valid phone number with country code.');
            setLoading(false);
            return;
        }

        // Call the specific webhook for code
        const response = await fetch(N8N_WEBHOOKS.phoneCode, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subscriber_id: userId,
                phone_number: phoneNumber.replace(/\+/g, '').trim() // Remove + if present
            })
        });

        if (!response.ok) throw new Error('Failed to get pairing code from server');

        const data = await response.json();
        
        // Handle Response: Check for 'pairing_code' or 'code' property
        if (data.pairing_code || data.code) {
            setPairingCode(data.pairing_code || data.code);
            setConnectionStatus('connecting'); 
            // Note: Phone flow mein hum 'validateConnection' call nahi kar rahe abhi.
            // User code daalega aur jab connect ho jayega to wo manually page refresh karega ya close karega.
        } else {
            setError('Could not generate pairing code. Please try again.');
        }
      } 
      // -----------------------------
      // CASE B: QR CODE FLOW
      // -----------------------------
      else {
        const response = await fetch(N8N_WEBHOOKS.initConnection, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subscriber_id: userId,
                connection_method: 'qr'
            })
        });

        if (!response.ok) throw new Error('Failed to initialize connection');
        const data = await response.json();

        if (data.qr_code) {
            const cleanQR = data.qr_code.replace('data:image/png;base64,', '');
            setQrCode(cleanQR);
            setConnectionStatus('connecting');
            
            // Start the Long Polling Check (Wait Logic) because n8n waits for scan
            startValidationProcess(); 
        } else {
            setError('Could not fetch QR code. Please check your internet.');
        }
      }

    } catch (err) {
      setError('Failed to start connection. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // 5. VALIDATION LOGIC (Only for QR Flow)
  // ==============================
  const startValidationProcess = async () => {
    try {
      // Ye request n8n par jayegi aur wahan wait karegi (15s/1min logic)
      const response = await fetch(N8N_WEBHOOKS.validateConnection, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriber_id: userId })
      });

      const result = await response.json();

      if (result.status === 'connected') {
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
        setError('❌ Access Denied: The number you connected does not match your registered Service Number.');
      } 
      else {
        // Agar timeout ho jaye ya koi aur issue (User ne scan nahi kiya)
        setConnectionStatus('disconnected');
        setQrCode(null);
        // Silent fail or message, user can click generate again
      }

    } catch (err) {
      console.error("Validation error:", err);
      setConnectionStatus('disconnected');
      setQrCode(null);
    }
  };

  // ==============================
  // 6. DISCONNECT FUNCTION
  // ==============================
  const handleDisconnect = async () => {
    const phone = instanceDetails?.phone_number || 'your WhatsApp number';
    if (!confirm(`Are you sure you want to disconnect ${phone}? Automated replies will stop immediately.`)) return;

    setLoading(true);
    try {
      const response = await fetch(N8N_WEBHOOKS.disconnect, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriber_id: userId })
      });

      if (!response.ok) throw new Error('Failed');
      
      setConnectionStatus('disconnected');
      setInstanceDetails(null);
      setQrCode(null);
      setPairingCode(null);
      alert('✅ WhatsApp disconnected successfully!');

    } catch (err) {
      setError('Failed to disconnect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // 7. RENDER HELPERS
  // ==============================

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

  // ==============================
  // 8. MAIN UI RENDER
  // ==============================
  return (
    <div className="max-w-[900px] mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">WhatsApp Connection</h1>
        <p className="text-[#A7B0AD] text-lg">Connect your WhatsApp number to activate Agentaria</p>
      </div>

      {/* --- STATE: CONNECTED --- */}
      {connectionStatus === 'connected' && instanceDetails && (
        <div className="bg-[#0D1211] border border-[#38F28D]/30 rounded-[18px] p-6 mb-6 shadow-[0_0_30px_rgba(56,242,141,0.05)]">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#38F28D]/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#38F28D]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Connected</h3>
                <p className="text-[#A7B0AD] mb-2">{instanceDetails.phone_number}</p>
                <div className="flex items-center gap-2 text-sm text-[#A7B0AD]">
                  <div className="w-2 h-2 bg-[#38F28D] rounded-full animate-pulse"></div><span>Active</span>
                </div>
              </div>
            </div>
            <button onClick={handleDisconnect} disabled={loading} className="px-4 py-2 border border-red-500/30 text-red-400 rounded-[12px] hover:bg-red-500/10 transition-colors">
                {loading ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
        </div>
      )}

      {/* --- STATE: DISCONNECTED / CONNECTING --- */}
      <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-8">
        {connectionStatus !== 'connected' && (
          <>
            <h2 className="text-2xl font-bold mb-6">Choose Connection Method</h2>

            {/* Toggle Buttons */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <button onClick={() => { setConnectionMethod('qr'); setPairingCode(null); setQrCode(null); setError(''); }}
                className={`p-6 rounded-[14px] border-2 transition-all text-left group ${connectionMethod === 'qr' ? 'border-[#38F28D] bg-[#38F28D]/5' : 'border-[#1A2321] hover:border-[#38F28D]/30'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">📷</span>
                  <h3 className="font-bold text-lg">QR Code</h3>
                </div>
                <p className="text-sm text-[#A7B0AD]">Scan with WhatsApp mobile app.</p>
              </button>

              <button onClick={() => { setConnectionMethod('phone'); setPairingCode(null); setQrCode(null); setError(''); }}
                className={`p-6 rounded-[14px] border-2 transition-all text-left group ${connectionMethod === 'phone' ? 'border-[#38F28D] bg-[#38F28D]/5' : 'border-[#1A2321] hover:border-[#38F28D]/30'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">📞</span>
                  <h3 className="font-bold text-lg">Phone Number</h3>
                </div>
                <p className="text-sm text-[#A7B0AD]">Link using Pairing Code.</p>
              </button>
            </div>

            {/* -------------------------------------------------- */}
            {/* OPTION 1: QR CODE FLOW (Detailed Instructions)     */}
            {/* -------------------------------------------------- */}
            {connectionMethod === 'qr' && !qrCode && (
               <div>
                 {/* Instructions Card */}
                 <div className="bg-[#070A0A] rounded-[14px] p-6 mb-6 border border-[#1A2321]">
                  <h3 className="font-semibold mb-4 text-[#F2F5F4]">How to connect:</h3>
                  <ol className="space-y-4 text-sm text-[#A7B0AD]">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#38F28D] text-[#070A0A] rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      <span>Open WhatsApp on your phone</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#38F28D] text-[#070A0A] rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      <span>Tap Menu (Android) or Settings (iPhone) and select <strong>Linked Devices</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#38F28D] text-[#070A0A] rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      <span>Tap on <strong>Link a Device</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#38F28D] text-[#070A0A] rounded-full flex items-center justify-center text-xs font-bold">4</span>
                      <span>Point your phone at this screen to scan the QR code</span>
                    </li>
                  </ol>
                 </div>

                 <button onClick={initiateConnection} disabled={loading} className="w-full bg-[#38F28D] text-[#070A0A] py-4 rounded-[14px] font-semibold hover:scale-[1.02] disabled:opacity-50 transition-all">
                    {loading ? 'Generating QR Code...' : 'Generate QR Code'}
                 </button>
               </div>
            )}
            
            {/* QR Generated State */}
            {connectionMethod === 'qr' && qrCode && (
              <div className="text-center animate-in fade-in zoom-in duration-300">
                 <h2 className="text-2xl font-bold mb-4">Scan QR Code</h2>
                 <div className="bg-white p-4 rounded-[18px] inline-block mb-4 shadow-2xl shadow-[#38F28D]/10">
                    <img src={`data:image/png;base64,${qrCode}`} alt="QR" className="w-64 h-64" />
                 </div>
                 <p className="text-yellow-500/80 bg-yellow-500/10 px-3 py-1 rounded-full inline-block mb-4">⚠️ Scan within 1 minute</p>
                 <button onClick={() => { setQrCode(null); setConnectionStatus('disconnected'); }} className="block mx-auto text-[#A7B0AD] underline hover:text-white">Cancel</button>
              </div>
            )}

            {/* -------------------------------------------------- */}
            {/* OPTION 2: PHONE NUMBER FLOW                        */}
            {/* -------------------------------------------------- */}
            {connectionMethod === 'phone' && !pairingCode && (
              <form onSubmit={initiateConnection}>
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A7B0AD]">📞</span>
                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[14px] pl-12 pr-4 py-4 text-lg focus:border-[#38F28D] focus:outline-none focus:ring-1 focus:ring-[#38F28D] transition-all"
                        placeholder="e.g. 923001234567" required />
                  </div>
                  <p className="text-xs text-[#A7B0AD] mt-2 ml-1">Enter number with country code (e.g., 92...)</p>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#38F28D] text-[#070A0A] py-4 rounded-[14px] font-bold hover:scale-[1.02] disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(56,242,141,0.2)]">
                  {loading ? 'Getting Code...' : 'Get Pairing Code'}
                </button>
              </form>
            )}

            {/* ✅ PAIRING CODE DISPLAY (No Timer, Close Button) */}
            {connectionMethod === 'phone' && pairingCode && (
               <div className="relative text-center bg-[#070A0A] border border-[#1A2321] rounded-[18px] p-8 animate-in fade-in slide-in-from-bottom-4">
                  {/* CLOSE BUTTON (Top Right) */}
                  <button 
                    onClick={() => { setPairingCode(null); setConnectionStatus('disconnected'); }}
                    className="absolute top-4 right-4 text-[#A7B0AD] hover:text-white bg-[#1A2321] hover:bg-red-500/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    title="Close and Reset"
                  >
                    ✕
                  </button>

                  <h3 className="text-[#A7B0AD] mb-6 font-medium">Enter this code on your phone</h3>
                  
                  {/* The Code Display */}
                  <div className="flex justify-center items-center gap-2 mb-8">
                     {String(pairingCode).split('').map((char, index) => (
                        <div key={index} className="w-12 h-16 flex items-center justify-center bg-[#1A2321] rounded-lg text-3xl font-mono text-[#38F28D] border border-[#38F28D]/20 shadow-[0_0_15px_rgba(56,242,141,0.1)]">
                           {char}
                        </div>
                     ))}
                  </div>

                  {/* Instructions for Phone */}
                  <div className="text-left bg-[#1A2321]/50 p-6 rounded-[14px] text-sm text-[#A7B0AD] space-y-3 border border-[#1A2321]">
                     <p className="flex items-center gap-3"><span className="w-5 h-5 bg-[#38F28D] text-black rounded-full flex items-center justify-center text-xs font-bold">1</span> Open WhatsApp notification or settings.</p>
                     <p className="flex items-center gap-3"><span className="w-5 h-5 bg-[#38F28D] text-black rounded-full flex items-center justify-center text-xs font-bold">2</span> Tap on <strong>"Enter Pairing Code"</strong>.</p>
                     <p className="flex items-center gap-3"><span className="w-5 h-5 bg-[#38F28D] text-black rounded-full flex items-center justify-center text-xs font-bold">3</span> Type the code exactly as shown above.</p>
                  </div>
               </div>
            )}
          </>
        )}

        {error && <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-[12px] p-4 text-red-400 text-center">{error}</div>}
      </div>

       {/* Info Cards (Footer) */}
       <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-[#0D1211] border border-[#1A2321] rounded-[14px] p-6 hover:border-[#38F28D]/20 transition-colors">
          <div className="w-10 h-10 bg-[#38F28D]/10 rounded-full flex items-center justify-center mb-3">⚡</div>
          <h3 className="font-bold mb-2">Instant Activation</h3>
          <p className="text-sm text-[#A7B0AD] leading-relaxed">Once connected, Agentaria starts handling messages immediately. No additional setup required.</p>
        </div>
        <div className="bg-[#0D1211] border border-[#1A2321] rounded-[14px] p-6 hover:border-[#38F28D]/20 transition-colors">
          <div className="w-10 h-10 bg-[#38F28D]/10 rounded-full flex items-center justify-center mb-3">🔒</div>
          <h3 className="font-bold mb-2">Secure Connection</h3>
          <p className="text-sm text-[#A7B0AD] leading-relaxed">Your WhatsApp data is encrypted end-to-end. We never store your messages or contacts.</p>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConnectionPage;