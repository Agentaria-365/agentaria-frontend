import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';

const WhatsAppConnectionPage = () => {
  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  const [connectionStatus, setConnectionStatus] = useState('checking'); 
  const [qrCode, setQrCode] = useState(null);
  const [pairingCode, setPairingCode] = useState(null); 
  const [connectionMethod, setConnectionMethod] = useState('qr'); 
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [instanceDetails, setInstanceDetails] = useState(null);
  const [userId, setUserId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(90); // 90 seconds = 1min 30sec

  // ==========================================
  // 2. WEBHOOK CONFIGURATION
  // ==========================================
  const N8N_WEBHOOKS = {
    initConnection: 'https://n8n.srv1192286.hstgr.cloud/webhook/whatsapp/init',
    validateConnection: 'https://n8n.srv1192286.hstgr.cloud/webhook/stop_qr', 
    disconnect: 'https://n8n.srv1192286.hstgr.cloud/webhook/whatsapp/disconnect',
    phoneCode: 'https://n8n.srv1192286.hstgr.cloud/webhook/code' 
  };

  // ==========================================
  // 3. COUNTDOWN TIMER LOGIC
  // ==========================================
  useEffect(() => {
    let timer;
    
    if ((qrCode || pairingCode) && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } 
    else if (timeLeft === 0) {
      // Jab timer 0 ho jaye, toh sab reset kar dein
      setQrCode(null);
      setPairingCode(null);
      setConnectionStatus('disconnected');
      setTimeLeft(90); 
    }

    // Cleanup function for interval
    return () => clearInterval(timer);
  }, [qrCode, pairingCode, timeLeft]);

  // ==========================================
  // 4. INITIAL SUPABASE CHECK (ON LOAD)
  // ==========================================
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setConnectionStatus('disconnected');
          return;
        }
        
        setUserId(user.id);

        const { data, error: fetchError } = await supabase
          .from('subscribers details')
          .select('instance_name, instance_status, service_number')
          .eq('subscriber_id', user.id)
          .single();

        if (fetchError || !data) {
          setConnectionStatus('disconnected');
          return;
        }

        // Check if instance is properly active
        if (
          (data.instance_status === 'open' || data.instance_status === 'active') && 
          data.instance_name
        ) {
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

  // ==========================================
  // 5. INITIATE CONNECTION (Action Handler)
  // ==========================================
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
    setTimeLeft(90); // Reset timer for fresh request

    try {
      // ----------------------------------------
      // CASE A: PHONE NUMBER / PAIRING CODE FLOW
      // ----------------------------------------
      if (connectionMethod === 'phone') {
        if (!phoneNumber || phoneNumber.length < 5) {
            setError('Please enter a valid phone number with country code.');
            setLoading(false);
            return;
        }

        const response = await fetch(N8N_WEBHOOKS.phoneCode, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                subscriber_id: userId,
                phone_number: phoneNumber.replace(/\+/g, '').trim()
            })
        });

        if (!response.ok) {
          throw new Error('Failed to get pairing code from server');
        }

        const data = await response.json();
        
        if (data.pairing_code || data.code) {
            setPairingCode(data.pairing_code || data.code);
            setConnectionStatus('connecting'); 
            
            // Start Validation (stop_qr logic) for Pairing Code
            startValidationProcess();
        } else {
            setError('Could not generate pairing code. Please try again.');
        }
      } 
      // ----------------------------------------
      // CASE B: QR CODE FLOW
      // ----------------------------------------
      else {
        const response = await fetch(N8N_WEBHOOKS.initConnection, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ 
              subscriber_id: userId, 
              connection_method: 'qr' 
            })
        });

        if (!response.ok) {
          throw new Error('Failed to initialize connection');
        }

        const data = await response.json();

        if (data.qr_code) {
            const cleanQR = data.qr_code.replace('data:image/png;base64,', '');
            setQrCode(cleanQR);
            setConnectionStatus('connecting');
            
            // Start Validation (stop_qr logic) for QR Code
            startValidationProcess(); 
        } else {
            setError('Could not fetch QR code. Please check your internet.');
        }
      }
    } catch (err) {
      setError('Failed to start connection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 6. VALIDATION POLLING (Long Polling)
  // ==========================================
  const startValidationProcess = async () => {
    try {
      const response = await fetch(N8N_WEBHOOKS.validateConnection, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          subscriber_id: userId 
        })
      });

      const result = await response.json();

      if (result.status === 'connected') {
        setConnectionStatus('connected');
        setQrCode(null);
        setPairingCode(null);
        setInstanceDetails({
          phone_number: result.phone || 'Connected',
          connected_at: new Date().toISOString()
        });
      } else {
        setConnectionStatus('disconnected');
        setQrCode(null);
        setPairingCode(null);
      }
    } catch (err) {
      setConnectionStatus('disconnected');
      setQrCode(null);
      setPairingCode(null);
    }
  };

  // ==========================================
  // 7. DISCONNECT LOGIC
  // ==========================================
  const handleDisconnect = async () => {
    const phone = instanceDetails?.phone_number || 'your WhatsApp number';
    
    if (!confirm(`Are you sure you want to disconnect ${phone}? Automated replies will stop immediately.`)) {
      return;
    }

    setLoading(true);

    try {
      await fetch(N8N_WEBHOOKS.disconnect, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          subscriber_id: userId 
        })
      });

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

  // ==========================================
  // 8. RENDER HELPERS
  // ==========================================

  // Loading Screen while checking Supabase auth status
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

  // ==========================================
  // 9. MAIN UI RENDER
  // ==========================================
  return (
    <div className="max-w-[900px] mx-auto pb-20 text-white">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">WhatsApp Connection</h1>
        <p className="text-[#A7B0AD] text-lg">Connect your WhatsApp number to activate Agentaria</p>
      </div>

      {/* -------------------------------------- */}
      {/* STATE: CONNECTED                       */}
      {/* -------------------------------------- */}
      {connectionStatus === 'connected' && instanceDetails && (
        <div className="bg-[#0D1211] border border-[#38F28D]/30 rounded-[18px] p-6 mb-6 shadow-[0_0_30px_rgba(56,242,141,0.05)]">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              
              <div className="w-12 h-12 bg-[#38F28D]/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#38F28D]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-1">Connected</h3>
                <p className="text-[#A7B0AD] mb-2">{instanceDetails.phone_number}</p>
                <div className="flex items-center gap-2 text-sm text-[#A7B0AD]">
                  <div className="w-2 h-2 bg-[#38F28D] rounded-full animate-pulse"></div>
                  <span>Active</span>
                </div>
              </div>

            </div>
            
            <button 
              onClick={handleDisconnect} 
              disabled={loading} 
              className="px-4 py-2 border border-red-500/30 text-red-400 rounded-[12px] hover:bg-red-500/10 transition-colors"
            >
                {loading ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------- */}
      {/* STATE: DISCONNECTED / CONNECTING       */}
      {/* -------------------------------------- */}
      <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-8">
        {connectionStatus !== 'connected' && (
          <>
            <h2 className="text-2xl font-bold mb-6">Choose Connection Method</h2>

            {/* Toggle Buttons */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              
              {/* QR Code Button */}
              <button 
                onClick={() => { 
                  setConnectionMethod('qr'); 
                  setPairingCode(null); 
                  setQrCode(null); 
                  setTimeLeft(90); 
                  setError(''); 
                }}
                className={`p-6 rounded-[14px] border-2 transition-all text-left group ${connectionMethod === 'qr' ? 'border-[#38F28D] bg-[#38F28D]/5' : 'border-[#1A2321] hover:border-[#38F28D]/30'}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">📷</span>
                  <h3 className="font-bold text-lg">QR Code</h3>
                </div>
                <p className="text-sm text-[#A7B0AD]">Scan with WhatsApp mobile app.</p>
              </button>

              {/* Phone Number Button */}
              <button 
                onClick={() => { 
                  setConnectionMethod('phone'); 
                  setPairingCode(null); 
                  setQrCode(null); 
                  setTimeLeft(90); 
                  setError(''); 
                }}
                className={`p-6 rounded-[14px] border-2 transition-all text-left group ${connectionMethod === 'phone' ? 'border-[#38F28D] bg-[#38F28D]/5' : 'border-[#1A2321] hover:border-[#38F28D]/30'}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">📞</span>
                  <h3 className="font-bold text-lg">Phone Number</h3>
                </div>
                <p className="text-sm text-[#A7B0AD]">Link using Pairing Code.</p>
              </button>
            </div>

            {/* ============================== */}
            {/* OPTION 1: QR CODE FLOW         */}
            {/* ============================== */}
            {connectionMethod === 'qr' && (
              !qrCode ? (
                 <div>
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
                   
                   <button 
                     onClick={initiateConnection} 
                     disabled={loading} 
                     className="w-full bg-[#38F28D] text-[#070A0A] py-4 rounded-[14px] font-bold hover:scale-[1.02] disabled:opacity-50 transition-all"
                   >
                      {loading ? 'Generating QR Code...' : 'Generate QR Code'}
                   </button>
                 </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                   <h2 className="text-2xl font-bold mb-6">Scan QR Code</h2>
                   
                   <div className="bg-white p-4 rounded-[18px] inline-flex items-center justify-center shadow-2xl shadow-[#38F28D]/10">
                      <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" className="w-64 h-64" />
                   </div>
                   
                   {/* QR Code Countdown Timer */}
                   <div className="mt-6 flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-6 py-2 rounded-full border border-yellow-500/20 font-mono font-bold">
                      ⏳ Expires in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                   </div>
                   
                   <button 
                     onClick={() => { 
                       setQrCode(null); 
                       setConnectionStatus('disconnected'); 
                     }} 
                     className="mt-6 text-[#A7B0AD] underline hover:text-white"
                   >
                     Cancel
                   </button>
                </div>
              )
            )}

            {/* ============================== */}
            {/* OPTION 2: PHONE NUMBER FLOW    */}
            {/* ============================== */}
            {connectionMethod === 'phone' && (
              !pairingCode ? (
                <form onSubmit={initiateConnection}>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold mb-3">Phone Number</label>
                    
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A7B0AD]">📞</span>
                      <input 
                        type="tel" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[14px] pl-12 pr-4 py-4 text-lg focus:border-[#38F28D] focus:outline-none focus:ring-1 focus:ring-[#38F28D] transition-all"
                        placeholder="e.g. 923001234567" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-[#38F28D] text-[#070A0A] py-4 rounded-[14px] font-bold hover:scale-[1.02] disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Getting Pairing Code...' : 'Get Pairing Code'}
                  </button>
                </form>
              ) : (
                <div className="relative text-center bg-[#070A0A] border border-[#1A2321] rounded-[18px] p-8 animate-in fade-in zoom-in">
                  
                  <button 
                    onClick={() => { 
                      setPairingCode(null); 
                      setConnectionStatus('disconnected'); 
                    }} 
                    className="absolute top-4 right-4 text-[#A7B0AD] hover:text-white bg-[#1A2321] w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    ✕
                  </button>
                  
                  <h3 className="text-[#A7B0AD] mb-4">Enter this code on your phone</h3>
                  
                  {/* Pairing Code Countdown Timer */}
                  <div className="mb-8 text-yellow-500 bg-yellow-500/10 px-6 py-2 rounded-full border border-yellow-500/20 font-mono font-bold w-fit mx-auto">
                     ⏳ Expires in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                  
                  <div className="flex justify-center gap-2 mb-8">
                     {String(pairingCode).split('').map((char, index) => (
                        <div 
                          key={index} 
                          className="w-12 h-16 flex items-center justify-center bg-[#1A2321] rounded-lg text-3xl font-mono text-[#38F28D] border border-[#38F28D]/20"
                        >
                           {char}
                        </div>
                     ))}
                  </div>
                  
                  <div className="text-left bg-[#1A2321]/50 p-6 rounded-[14px] text-sm text-[#A7B0AD] space-y-3">
                     <p>1. Open WhatsApp notification.</p>
                     <p>2. Tap "Enter Pairing Code".</p>
                     <p>3. Type the 8-digit code shown above.</p>
                  </div>
                  
                  <button 
                    onClick={() => { 
                      setPairingCode(null); 
                      setConnectionStatus('disconnected'); 
                    }} 
                    className="mt-8 text-gray-500 underline"
                  >
                    Cancel and go back
                  </button>
                </div>
              )
            )}
          </>
        )}

        {/* Error Message Display */}
        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-[12px] p-4 text-red-400 text-center">
            {error}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* 10. FOOTER INFO CARDS                        */}
      {/* ========================================== */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        
        <div className="bg-[#0D1211] border border-[#1A2321] rounded-[14px] p-6 hover:border-[#38F28D]/20 transition-all">
          <div className="w-10 h-10 bg-[#38F28D]/10 rounded-full flex items-center justify-center mb-3 text-xl">
            ⚡
          </div>
          <h3 className="font-bold mb-2">Instant Activation</h3>
          <p className="text-sm text-[#A7B0AD] leading-relaxed">
            Agentaria starts handling chats immediately after connection. No additional setup required.
          </p>
        </div>
        
        <div className="bg-[#0D1211] border border-[#1A2321] rounded-[14px] p-6 hover:border-[#38F28D]/20 transition-all">
          <div className="w-10 h-10 bg-[#38F28D]/10 rounded-full flex items-center justify-center mb-3 text-xl">
            🔒
          </div>
          <h3 className="font-bold mb-2">Secure Connection</h3>
          <p className="text-sm text-[#A7B0AD] leading-relaxed">
            Your data is encrypted end-to-end. We never store your messages or contacts.
          </p>
        </div>

      </div>

    </div>
  );
};

export default WhatsAppConnectionPage;