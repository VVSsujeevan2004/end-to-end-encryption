import React, { useState, useEffect, useRef } from 'react';
import { Send, Lock, ShieldCheck, AlertTriangle, Key, X, Fingerprint } from 'lucide-react';
import { type Message, type User, LogEventType } from '../types';
import * as CryptoService from '../services/crypto';

interface ChatProps {
  currentUser: User;
  onLogEvent: (type: LogEventType, metadata: any, severity?: 'INFO' | 'WARNING' | 'CRITICAL') => void;
  suspiciousKeywords: string[];
}

const Chat: React.FC<ChatProps> = ({ currentUser, onLogEvent, suspiciousKeywords }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [aesKey, setAesKey] = useState<CryptoKey | null>(null);
  const [handshakeStatus, setHandshakeStatus] = useState<string>('Initializing...');
  const [sessionFingerprint, setSessionFingerprint] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Session Key with Hybrid RSA/AES Handshake
  useEffect(() => {
    const initSession = async () => {
      try {
        setHandshakeStatus('Generating RSA Keypair...');
        // 1. Client generates RSA Keypair
        const rsaPair = await CryptoService.generateKeyPair();
        
        // 2. Simulate "Server" generating an AES Session Key
        setHandshakeStatus('Negotiating Session Key...');
        const sessionKeyRaw = await CryptoService.generateAESKey();
        
        // 3. Simulate "Server" encrypting the AES Key with Client's RSA Public Key (Key Encapsulation)
        const exportedSessionKey = await CryptoService.exportKey(sessionKeyRaw);
        const encryptedSessionKey = await CryptoService.encryptRSA(rsaPair.publicKey, exportedSessionKey);

        // 4. Client receives encrypted key and decrypts it with RSA Private Key
        setHandshakeStatus('Decrypting Session Key...');
        const decryptedSessionKeyRaw = await CryptoService.decryptRSA(rsaPair.privateKey, encryptedSessionKey);
        const finalAesKey = await CryptoService.importAESKey(decryptedSessionKeyRaw);

        // Calculate Fingerprint for display
        const fingerprint = (await CryptoService.hashData(CryptoService.bufferToBase64(encryptedSessionKey))).substring(0, 16).toUpperCase();
        setSessionFingerprint(fingerprint);

        setAesKey(finalAesKey);
        setHandshakeStatus('Secure');

        onLogEvent(LogEventType.KEY_EXCHANGE, { 
          mechanism: 'HYBRID RSA-2048/AES-256', 
          rsaKeyFingerprint: fingerprint,
          status: 'SUCCESS' 
        }, 'INFO');
        
        // Add a welcome system message
        setMessages([{
          id: 'sys-1',
          senderId: 'system',
          content: 'Secure Hybrid Channel Established. RSA Handshake Verified.',
          encryptedContent: '',
          timestamp: Date.now(),
          integrityHash: '',
          isSystem: true
        }]);
      } catch (e) {
        console.error("Handshake failed", e);
        setHandshakeStatus('Handshake Failed');
        onLogEvent(LogEventType.ANOMALY_DETECTED, { error: 'RSA Key Exchange Failed' }, 'CRITICAL');
      }
    };

    initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !aesKey) return;

    const content = inputText;
    setInputText('');
    
    // 1. Check for suspicious keywords (Client-side DLP)
    const detectedKeywords = suspiciousKeywords.filter(kw => content.toLowerCase().includes(kw));
    if (detectedKeywords.length > 0) {
      onLogEvent(LogEventType.SUSPICIOUS_KEYWORD, { keywords: detectedKeywords, length: content.length }, 'WARNING');
    }

    // 2. Encrypt
    const { iv, ciphertext } = await CryptoService.encryptMessage(aesKey, content);
    
    // 3. Hash (Integrity)
    const integrityHash = await CryptoService.hashData(ciphertext);

    const newMessage: Message = {
      id: crypto.randomUUID(),
      senderId: currentUser.id,
      content: content,
      encryptedContent: `${iv}:${ciphertext}`, // Format: IV:Ciphertext
      timestamp: Date.now(),
      integrityHash: integrityHash
    };

    setMessages(prev => [...prev, newMessage]);
    onLogEvent(LogEventType.MESSAGE_SENT, { msgId: newMessage.id, size: ciphertext.length, hash: integrityHash }, 'INFO');

    // Simulate Echo Response (Mocking a recipient)
    setTimeout(async () => {
      const responses = [
        "I've received the documents. Verifying signatures now.",
        "Understood. Ensure the logs are flushed after the operation.",
        "We need to be careful with this channel.",
        "Confirmed.",
        "Can you send the financial report for Q3?"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const { iv: rIv, ciphertext: rCipher } = await CryptoService.encryptMessage(aesKey, randomResponse);
      const rHash = await CryptoService.hashData(rCipher);
      
      const responseMsg: Message = {
        id: crypto.randomUUID(),
        senderId: 'remote-user',
        content: randomResponse,
        encryptedContent: `${rIv}:${rCipher}`,
        timestamp: Date.now(),
        integrityHash: rHash
      };
      
      setMessages(prev => [...prev, responseMsg]);
      onLogEvent(LogEventType.MESSAGE_DECRYPTED, { msgId: responseMsg.id, status: 'SUCCESS' }, 'INFO');
    }, 1500);
  };

  const handleReportIncident = () => {
    if (confirm("REPORT SECURITY INCIDENT?\n\nThis will flag the current session as compromised and notify the forensic team immediately.")) {
      onLogEvent(LogEventType.ANOMALY_DETECTED, { 
        type: 'USER_REPORTED_INCIDENT',
        reason: 'User suspected compromise',
        sessionFingerprint 
      }, 'CRITICAL');
      alert("Incident reported. Security team notified.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative">
      
      {/* Session Key Modal */}
      {showKeyModal && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="text-green-500" />
                Session Verification
              </h3>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-lg font-mono text-sm border border-slate-800">
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider flex items-center gap-2">
                  <Fingerprint size={14} />
                  RSA-2048 Key Fingerprint
                </p>
                <p className="text-indigo-400 break-all">{sessionFingerprint.match(/.{1,4}/g)?.join(' ')}</p>
              </div>
              <div className="text-xs text-slate-400">
                <p className="mb-2">Compare this fingerprint with your partner via a secondary channel (e.g., phone call) to prevent Man-in-the-Middle attacks.</p>
                <div className="flex items-center gap-2 text-green-500">
                  <Lock size={12} />
                  <span>AES-256-GCM Session Established</span>
                </div>
              </div>
              <button 
                onClick={() => setShowKeyModal(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Verified & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
              U1
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950"></div>
          </div>
          <div>
            <h2 className="font-semibold text-sm">User 1 (Partner)</h2>
            <div className="flex items-center gap-1.5 text-xs text-green-400">
              <Lock size={12} />
              <span>{handshakeStatus === 'Secure' ? 'Hybrid RSA/AES Encrypted' : handshakeStatus}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setShowKeyModal(true)}
             className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors" 
             title="View Session Keys"
           >
             <Key size={18} className={aesKey ? "text-green-400" : "text-slate-600"} />
           </button>
           <button 
             onClick={handleReportIncident}
             className="p-2 hover:bg-red-900/30 rounded-lg text-slate-400 hover:text-red-400 transition-colors" 
             title="Report Incident"
           >
             <AlertTriangle size={18} />
           </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isSystem = msg.isSystem;

          if (isSystem) {
             return (
               <div key={msg.id} className="flex justify-center my-4">
                 <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700 font-mono flex items-center gap-2">
                   <ShieldCheck size={12} />
                   {msg.content}
                 </span>
               </div>
             );
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] group relative`}>
                <div className={`
                  p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${isMe 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'}
                `}>
                  {msg.content}
                </div>
                
                {/* Forensic Metadata Popover (Hover) */}
                <div className="absolute top-0 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/90 text-[10px] p-2 rounded border border-slate-700 text-slate-400 font-mono w-64 pointer-events-none z-10 left-0 mb-1 shadow-xl">
                  <div className="flex items-center gap-1 mb-1 text-green-500 font-bold border-b border-slate-800 pb-1">
                     <Lock size={8} /> AES-256-GCM
                  </div>
                  <p><span className="text-slate-500">HASH:</span> {msg.integrityHash.substring(0, 16)}...</p>
                  <p><span className="text-slate-500">TS:</span> {msg.timestamp}</p>
                  <p><span className="text-slate-500">IV:</span> {msg.encryptedContent.split(':')[0].substring(0,8)}...</p>
                </div>

                <div className={`text-[10px] text-slate-500 mt-1 flex gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={aesKey ? "Type a secure message..." : "Waiting for handshake..."}
            disabled={!aesKey}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600 disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || !aesKey}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 flex items-center justify-center transition-all shadow-lg shadow-indigo-900/20"
          >
            <Send size={18} />
          </button>
        </form>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 px-1">
          <ShieldCheck size={10} className={aesKey ? "text-green-500" : "text-yellow-500"} />
          <span>{aesKey ? 'RSA+AES Hybrid Encryption Active' : 'Establishing Secure Channel...'}</span>
          <span className="mx-1">•</span>
          <span className="font-mono">{sessionFingerprint ? `FP: ${sessionFingerprint.substring(0,4)}...` : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default Chat;