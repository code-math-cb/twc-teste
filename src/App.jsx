import React, { useState, useEffect, useRef } from 'react';

// --- ESTILOS GLOBAIS & EFEITOS (CRT, Glitch, Fog) ---
const ThemeStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=VT323&display=swap');

    :root {
      --re4-green: #3f4a3c;
      --re4-sepia: #4a3e2a;
      --sh-blood: #8a0303;
      --blood-hover: #b00000;
      --inventory-bg: rgba(20, 20, 20, 0.85);
      --inventory-grid: rgba(255, 255, 255, 0.05);
    }

    body {
      background-color: #050505;
      font-family: 'Courier Prime', monospace;
      color: #d1d5db;
      overflow-x: hidden;
      margin: 0;
    }

    .font-pixel { font-family: 'VT323', monospace; }

    .crt::before {
      content: " ";
      display: block;
      position: fixed;
      top: 0; left: 0; bottom: 0; right: 0;
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
      z-index: 50;
      background-size: 100% 2px, 3px 100%;
      pointer-events: none;
    }

    .fog-bg {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)" opacity="0.08"/></svg>');
      pointer-events: none;
      z-index: -1;
      opacity: 0.6;
      mix-blend-mode: overlay;
    }

    .atmospheric-bg {
      background: radial-gradient(circle at center, var(--re4-sepia) 0%, #050505 80%);
    }

    .glitch {
      position: relative;
      color: white;
    }
    .glitch::before, .glitch::after {
      content: attr(data-text);
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: transparent;
    }
    .glitch::before {
      left: 2px;
      text-shadow: -2px 0 red;
      clip: rect(24px, 550px, 90px, 0);
      animation: glitch-anim 3s infinite linear alternate-reverse;
    }
    .glitch::after {
      left: -2px;
      text-shadow: -2px 0 blue;
      clip: rect(85px, 550px, 140px, 0);
      animation: glitch-anim 2.5s infinite linear alternate-reverse;
    }

    @keyframes glitch-anim {
      0% { clip: rect(10px, 9999px, 86px, 0); }
      20% { clip: rect(65px, 9999px, 16px, 0); }
      40% { clip: rect(96px, 9999px, 100px, 0); }
      60% { clip: rect(13px, 9999px, 55px, 0); }
      80% { clip: rect(44px, 9999px, 32px, 0); }
      100% { clip: rect(81px, 9999px, 7px, 0); }
    }

    .insert-coin { animation: blink 1.5s infinite; }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; text-shadow: 0 0 10px red; } }

    .attache-case {
      background-color: var(--inventory-bg);
      background-image: linear-gradient(var(--inventory-grid) 1px, transparent 1px),
                        linear-gradient(90deg, var(--inventory-grid) 1px, transparent 1px);
      background-size: 40px 40px;
      border: 4px double #5c5c5c;
      box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
    }
    
    .stamp-sold-out {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%) rotate(-15deg);
      border: 4px solid #8a0303;
      color: #8a0303;
      font-size: 2rem;
      font-weight: bold;
      padding: 0.5rem 1rem;
      text-transform: uppercase;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(2px);
      z-index: 10;
      letter-spacing: 0.2em;
    }

    .bomb-pulse {
      animation: bombBlink 0.5s infinite alternate;
    }
    @keyframes bombBlink {
      0% { filter: drop-shadow(0 0 2px red); }
      100% { filter: drop-shadow(0 0 15px red); }
    }

    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #111; }
    ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--sh-blood); }
  `}} />
);

// --- UTILITÁRIOS (ÁUDIO EASTER EGGS) ---
const playSound = (type) => {
  const sounds = {
    move: "📦 [Áudio: Item movido]",
    combine: "✂️💣 [Áudio: Fio cortado! Bomba desarmada!]",
    save: "🎵 [Áudio: Tema da Save Room]",
    error: "❌ [Áudio: Som de erro PS2]",
    start: "🎮 [Áudio: Resident Evil 4]",
    beep: "🧨 [Áudio: Bip de bomba]"
  };
  console.log(`%c${sounds[type]}`, 'color: #8a0303; font-weight: bold; background: black; padding: 4px;');
};

// --- ICONES & SVGS ---
const Icons = {
  Skull: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.686 2 6 4.686 6 8c0 2.228 1.157 4.168 2.89 5.308C8.36 14.15 8 15.02 8 16v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2c0-.98-.36-1.85-.89-2.692C16.843 12.168 18 10.228 18 8c0-3.314-2.686-6-6-6z"></path><path d="M9 16h6"></path><path d="M9 18h6"></path></svg>,
  Lock: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  Pix: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M12 2L2 12l10 10 10-10L12 2z"></path><path d="M12 6L6 12l6 6 6-6-6-6z"></path></svg>,
  // Novos Icones para o Captcha
  Bomb: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="#222" className="bomb-pulse">
      <rect x="4" y="8" width="16" height="12" rx="2" stroke="#444" strokeWidth="2" fill="#111"/>
      <rect x="6" y="10" width="12" height="4" fill="red" opacity="0.8"/>
      <text x="8" y="13" fill="black" fontSize="4" fontFamily="monospace" fontWeight="bold">00:03</text>
      <path d="M12 8 V4 C12 2 16 2 16 4" stroke="red" strokeWidth="1.5" fill="none"/>
      <circle cx="16" cy="4" r="1.5" fill="orange"/>
    </svg>
  ),
  WireCutter: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
      <path d="M6 20 L10 12 L14 20" stroke="#555" strokeWidth="3" strokeLinecap="round"/>
      <path d="M8 6 L10 12 L12 6" stroke="#ccc" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="10" cy="12" r="1" fill="black"/>
    </svg>
  ),
  DefusedBomb: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="#222">
      <rect x="4" y="8" width="16" height="12" rx="2" stroke="#444" strokeWidth="2" fill="#111"/>
      <rect x="6" y="10" width="12" height="4" fill="#004400" opacity="0.8"/>
      <text x="8" y="13" fill="#00ff00" fontSize="4" fontFamily="monospace" fontWeight="bold">SAFE</text>
      <path d="M12 8 V6" stroke="#444" strokeWidth="1.5" fill="none"/>
      <path d="M14 6 C15 4 16 4 16 6" stroke="red" strokeWidth="1.5" fill="none" strokeDasharray="1 1"/>
    </svg>
  )
};

// --- COMPONENTE: CONTADOR DIGITAL ---
const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({ h: '72', m: '00', s: '00' });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const s = 59 - now.getSeconds();
      const m = 59 - now.getMinutes();
      setTimeLeft({ h: '72', m: m.toString().padStart(2, '0'), s: s.toString().padStart(2, '0') });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center mt-8 p-4 border border-red-900 bg-black bg-opacity-60 shadow-[0_0_15px_rgba(138,3,3,0.3)]">
      <p className="text-gray-500 text-sm uppercase tracking-widest mb-2 font-bold">Tempo Restante de Vida</p>
      <div className="font-pixel text-5xl md:text-7xl text-red-600 tracking-widest insert-coin drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]">
        {timeLeft.h}:{timeLeft.m}:{timeLeft.s}
      </div>
    </div>
  );
};

// --- COMPONENTE: PUZZLE CAPTCHA (Bomba no Attache Case) ---
const InventoryCaptcha = ({ onSolved }) => {
  const [items, setItems] = useState([
    { id: 'cutter', type: 'cutter', slot: 0 },
    { id: 'c4_bomb', type: 'bomb', slot: 5 },
  ]);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    if (!solved) {
      const interval = setInterval(() => playSound('beep'), 2000);
      return () => clearInterval(interval);
    }
  }, [solved]);

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('itemId', item.id);
    playSound('move');
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, targetSlotId) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('itemId');
    const targetItem = items.find(i => i.slot === targetSlotId);
    
    if (targetItem && targetItem.id !== draggedId) {
      const draggedItem = items.find(i => i.id === draggedId);
      
      // Lógica de desarme: Arrastar Alicate (cutter) sobre a Bomba (bomb)
      if (draggedItem.type === 'cutter' && targetItem.type === 'bomb') {
        playSound('combine');
        setItems([{ id: 'defused_bomb', type: 'defused', slot: targetSlotId }]);
        setSolved(true);
        onSolved();
      } else {
        playSound('error');
      }
    } else if (!targetItem) {
      // Move para slot vazio
      setItems(items.map(i => i.id === draggedId ? { ...i, slot: targetSlotId } : i));
      playSound('move');
    }
  };

  const slots = Array.from({ length: 8 }).map((_, i) => i);

  return (
    <div className="mt-8 p-6 attache-case">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl uppercase font-bold text-gray-300 flex items-center gap-2">
          <Icons.Skull /> Ameaça Detectada
        </h3>
        <button 
          type="button"
          onClick={() => { onSolved(); setSolved(true); playSound('combine'); }}
          className="text-xs text-gray-500 hover:text-white underline cursor-pointer"
          title="Acessibilidade: Pular Puzzle"
        >
          [ Bypass System ]
        </button>
      </div>
      
      {!solved ? (
        <p className="text-sm text-red-500 mb-6 italic animate-pulse">
          "CUIDADO: Um explosivo C4 foi plantado no seu inventário. Arraste o ALICATE até a BOMBA para cortar o fio vermelho antes de pagar."
        </p>
      ) : (
        <p className="text-sm text-green-500 mb-6 font-bold uppercase blink">
          STATUS: AMEAÇA NEUTRALIZADA. COMUNICAÇÃO COM MERCADO PAGO ESTABELECIDA.
        </p>
      )}

      <div className="grid grid-cols-4 gap-2 border border-gray-700 bg-black/50 p-2 w-fit mx-auto relative">
        {/* Overlay vermelho se não resolvido */}
        {!solved && <div className="absolute inset-0 bg-red-900/10 pointer-events-none animate-pulse"></div>}
        
        {slots.map(slotId => {
          const itemInSlot = items.find(i => i.slot === slotId);
          return (
            <div 
              key={slotId}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, slotId)}
              className="w-16 h-16 border border-gray-800 bg-gray-900/40 flex items-center justify-center relative hover:bg-gray-800/60 transition-colors"
            >
              {itemInSlot && (
                <div
                  draggable={!solved && itemInSlot.type === 'cutter'} // Apenas o alicate é arrastável idealmente
                  onDragStart={(e) => handleDragStart(e, itemInSlot)}
                  className={`cursor-grab active:cursor-grabbing transform hover:scale-110 transition-transform ${solved ? 'pointer-events-none' : ''}`}
                >
                  {itemInSlot.type === 'bomb' && <Icons.Bomb />}
                  {itemInSlot.type === 'cutter' && <Icons.WireCutter />}
                  {itemInSlot.type === 'defused' && <Icons.DefusedBomb />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- COMPONENTE: INGRESSOS (Tickets e Lotes) ---
const TicketSelection = ({ onContinue, globalTicketsSold }) => {
  const [quantities, setQuantities] = useState({ loteAtivo: 0 });

  // Lógica de Virada de Lote (10 em 10)
  let activeLote = 1;
  let price = 80.00;
  
  if (globalTicketsSold >= 20) {
    activeLote = 3;
    price = 110.00;
  } else if (globalTicketsSold >= 10) {
    activeLote = 2;
    price = 105.00;
  }

  const total = quantities.loteAtivo * price;

  const handleUpdate = (delta) => {
    setQuantities(prev => {
      const newVal = Math.max(0, prev.loteAtivo + delta);
      if (newVal > prev.loteAtivo) playSound('move');
      return { loteAtivo: newVal };
    });
  };

  const handleAdvance = () => {
    if (total > 0) {
      playSound('start');
      onContinue(quantities.loteAtivo, price, total, activeLote);
    } else {
      playSound('error');
      alert("Selecione pelo menos um passaporte para sobreviver.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-bold glitch font-pixel tracking-widest mb-4" data-text="ARCADE TWC 2026">
          ARCADE TWC 2026
        </h1>
        <p className="text-gray-400 uppercase tracking-[0.3em] text-sm md:text-base">Sobreviventes confirmados: {globalTicketsSold}</p>
        <Countdown />
      </div>

      <div className="space-y-6">
        {/* LOTE 1 */}
        <div className={`attache-case relative p-6 flex flex-col md:flex-row justify-between items-center transition-colors duration-300 ${activeLote === 1 ? 'hover:border-red-900 border-red-900/50' : 'opacity-60 grayscale cursor-not-allowed'}`}>
          {activeLote > 1 && <div className="stamp-sold-out font-pixel">SOLD OUT</div>}
          {activeLote < 1 && <div className="absolute top-4 right-4 text-gray-600"><Icons.Lock /></div>}
          
          <div>
            <h2 className={`text-2xl font-bold uppercase ${activeLote === 1 ? 'text-red-600 drop-shadow-[0_0_5px_rgba(255,0,0,0.5)]' : 'text-gray-500'}`}>Lote 1: Blood First</h2>
            <p className="text-gray-400 text-sm mt-1">{activeLote > 1 ? 'Eles não resistiram.' : 'Disponível. Os primeiros a cair.'}</p>
          </div>
          
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <span className={`text-3xl font-pixel ${activeLote === 1 ? 'text-green-500' : 'text-gray-500'}`}>R$ 80,00</span>
            {activeLote === 1 && (
              <div className="flex items-center border border-gray-600 bg-black z-20 relative">
                <button onClick={() => handleUpdate(-1)} className="px-4 py-2 hover:bg-gray-800 text-gray-400 font-bold">-</button>
                <span className="px-4 py-2 font-pixel text-xl min-w-[3rem] text-center">{quantities.loteAtivo}</span>
                <button onClick={() => handleUpdate(1)} className="px-4 py-2 hover:bg-gray-800 text-gray-400 font-bold">+</button>
              </div>
            )}
          </div>
        </div>

        {/* LOTE 2 */}
        <div className={`attache-case relative p-6 flex flex-col md:flex-row justify-between items-center transition-colors duration-300 ${activeLote === 2 ? 'hover:border-red-900 border-red-900/50' : (activeLote > 2 ? 'opacity-60 grayscale cursor-not-allowed' : 'opacity-80')}`}>
          {activeLote > 2 && <div className="stamp-sold-out font-pixel">SOLD OUT</div>}
          {activeLote < 2 && <div className="absolute top-4 right-4 text-gray-600"><Icons.Lock /></div>}
          
          <div>
            <h2 className={`text-2xl font-bold uppercase ${activeLote === 2 ? 'text-red-600 drop-shadow-[0_0_5px_rgba(255,0,0,0.5)]' : 'text-gray-500'}`}>Lote 2: Passaporte Padrão</h2>
            <p className="text-gray-400 text-sm mt-1">{activeLote < 2 ? 'Bloqueado. Aguardando mortes (10).' : (activeLote > 2 ? 'Esgotado.' : 'Sua chance de sobrevivência.')}</p>
          </div>
          
          <div className="flex items-center gap-6 mt-4 md:mt-0 pr-8 md:pr-0">
            <span className={`text-3xl font-pixel ${activeLote === 2 ? 'text-green-500' : 'text-gray-500'}`}>R$ 105,00</span>
            {activeLote === 2 && (
              <div className="flex items-center border border-gray-600 bg-black z-20 relative">
                <button onClick={() => handleUpdate(-1)} className="px-4 py-2 hover:bg-gray-800 text-gray-400 font-bold">-</button>
                <span className="px-4 py-2 font-pixel text-xl min-w-[3rem] text-center">{quantities.loteAtivo}</span>
                <button onClick={() => handleUpdate(1)} className="px-4 py-2 hover:bg-gray-800 text-gray-400 font-bold">+</button>
              </div>
            )}
          </div>
        </div>

        {/* LOTE 3 */}
        <div className={`attache-case relative p-6 flex flex-col md:flex-row justify-between items-center transition-colors duration-300 ${activeLote === 3 ? 'hover:border-red-900 border-red-900/50' : 'opacity-80'}`}>
          {activeLote < 3 && <div className="absolute top-4 right-4 text-gray-600"><Icons.Lock /></div>}
          
          <div>
            <h2 className={`text-2xl font-bold uppercase ${activeLote === 3 ? 'text-red-600 drop-shadow-[0_0_5px_rgba(255,0,0,0.5)]' : 'text-gray-500'}`}>Lote 3: Última Chamada</h2>
            <p className="text-gray-400 text-sm mt-1">{activeLote < 3 ? 'Bloqueado. Aguardando mortes (20).' : 'Desespero final.'}</p>
          </div>
          
          <div className="flex items-center gap-6 mt-4 md:mt-0 pr-8 md:pr-0">
            <span className={`text-3xl font-pixel ${activeLote === 3 ? 'text-green-500' : 'text-gray-500'}`}>R$ 110,00</span>
            {activeLote === 3 && (
              <div className="flex items-center border border-gray-600 bg-black z-20 relative">
                <button onClick={() => handleUpdate(-1)} className="px-4 py-2 hover:bg-gray-800 text-gray-400 font-bold">-</button>
                <span className="px-4 py-2 font-pixel text-xl min-w-[3rem] text-center">{quantities.loteAtivo}</span>
                <button onClick={() => handleUpdate(1)} className="px-4 py-2 hover:bg-gray-800 text-gray-400 font-bold">+</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <button 
          onClick={handleAdvance}
          className={`px-12 py-4 border-2 border-red-900 bg-red-950/30 text-red-500 uppercase font-bold tracking-widest hover:bg-red-900 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(138,3,3,0.2)] hover:shadow-[0_0_25px_rgba(138,3,3,0.6)] ${total > 0 ? 'insert-coin' : 'opacity-50 cursor-not-allowed'}`}
        >
          {total > 0 ? `Sobreviva à Noite (R$ ${total.toFixed(2)})` : 'Selecione um Ingresso'}
        </button>
      </div>
    </div>
  );
};

// --- COMPONENTE: CHECKOUT (Integração MP e Finalização) ---
const CheckoutForm = ({ onBack, checkoutData, onPurchaseComplete }) => {
  const { qty, total, lote } = checkoutData;
  const [captchaSolved, setCaptchaSolved] = useState(false);
  
  // Estados para API Mercado Pago Mock
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    playSound('save');
  }, []);

  // Simula a chamada POST para api.mercadopago.com
  const handleGeneratePix = (e) => {
    e.preventDefault();
    if (!captchaSolved) return;
    
    setIsGeneratingPix(true);
    // Mock de latência de rede
    setTimeout(() => {
      setPixData({
        qrCodeURL: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126580014br.gov.bcb.pix0136sua-chave-pix-aqui-arcade20265204000053039865802BR5922Arcade%20TWC%206009SAO%20PAULO62070503***6304", // Gerador de QR Genérico para ilustrar
        copyPasteCode: "00020126580014br.gov.bcb.pix0136sua-chave-pix-aqui-arcade20265204000053039865405" + total.toFixed(2) + "5802BR5922Arcade%20TWC%206009SAO%20PAULO62070503***6304"
      });
      setIsGeneratingPix(false);
    }, 2000);
  };

  // Simula o Webhook recebendo a confirmação
  const handleVerifyPayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      onPurchaseComplete(qty); // Confirma e aumenta o banco de dados
    }, 2500);
  };

  const copyPix = () => {
    navigator.clipboard.writeText(pixData?.copyPasteCode);
    alert("Código PIX copiado para o inventário!");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
      <button onClick={onBack} className="text-gray-500 hover:text-white uppercase text-sm tracking-widest mb-8 flex items-center gap-2">
        <span>&larr;</span> Voltar para a névoa
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Formulário de Dados e Captcha */}
        <div className="space-y-6">
          <div className="border border-gray-800 bg-black/60 p-6 shadow-xl relative overflow-hidden">
            
            {/* Overlay Escurecendo o form quando o PIX é gerado */}
            {pixData && <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center p-6 text-center backdrop-blur-sm">
                <div>
                  <Icons.Lock />
                  <p className="text-red-500 font-pixel mt-4">Dados trancados. Aguardando PIX...</p>
                </div>
            </div>}

            <h2 className="text-2xl font-bold uppercase text-red-700 border-b border-red-900 pb-2 mb-6">Dados do Jogador</h2>
            <form className="space-y-4" onSubmit={handleGeneratePix}>
              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">Nome Completo</label>
                <input required type="text" className="w-full bg-transparent border-b border-gray-600 p-2 text-gray-200 focus:outline-none focus:border-red-600 transition-colors font-mono" placeholder="Leon S. Kennedy" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">E-mail</label>
                <input required type="email" className="w-full bg-transparent border-b border-gray-600 p-2 text-gray-200 focus:outline-none focus:border-red-600 transition-colors font-mono" placeholder="leon@bsaa.org" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">CPF</label>
                <input required type="text" className="w-full bg-transparent border-b border-gray-600 p-2 text-gray-200 focus:outline-none focus:border-red-600 transition-colors font-mono" placeholder="000.000.000-00" />
              </div>
              
              <div className="pt-6">
                <InventoryCaptcha onSolved={() => setCaptchaSolved(true)} />
              </div>

              {!pixData && (
                <button 
                  type="submit"
                  disabled={!captchaSolved || isGeneratingPix}
                  className={`w-full mt-8 py-4 uppercase font-bold tracking-widest transition-all duration-300 border-2
                    ${captchaSolved 
                      ? 'border-green-600 bg-green-900/30 text-green-400 hover:bg-green-900 hover:text-white' 
                      : 'border-gray-800 bg-gray-900 text-gray-600 cursor-not-allowed'}`}
                >
                  {isGeneratingPix ? 'Iniciando Transmissão API...' : (captchaSolved ? 'Gerar PIX Seguro (Mercado Pago)' : 'Bomba Ativa. Bloqueado.')}
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Resumo e Interface de Pagamento PIX */}
        <div className="space-y-6">
          <div className="attache-case p-6">
             <h2 className="text-xl font-bold uppercase text-gray-300 mb-4 border-b border-gray-600 pb-2">Save Room Log</h2>
             <div className="flex justify-between text-gray-400 mb-2">
               <span>Lote {lote} (x{qty})</span>
               <span>R$ {total.toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-xl font-pixel text-green-500 mt-6 border-t border-gray-600 pt-4">
               <span>TOTAL DA SOBREVIVÊNCIA</span>
               <span>R$ {total.toFixed(2)}</span>
             </div>
          </div>

          <div className="border border-gray-800 bg-black/60 p-6">
             <h2 className="text-xl font-bold uppercase text-gray-300 mb-6 flex items-center gap-2">
               <Icons.Pix /> Mercado Pago Connection
             </h2>

             {!pixData && !isGeneratingPix && (
               <div className="text-center p-8 border border-gray-800 text-gray-500 font-pixel">
                  <p>Aguardando dados e desarmamento para estabelecer conexão encriptada...</p>
               </div>
             )}

             {isGeneratingPix && (
                <div className="text-center p-8 border border-green-900/50 text-green-500 font-pixel animate-pulse">
                  <p>Criptografando payload...</p>
                  <p>Chamando api.mercadopago.com/v1...</p>
                  <p>Gerando QR Code...</p>
                </div>
             )}

             {pixData && (
               <div className="text-center p-6 border border-green-900 bg-black shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all">
                 <p className="text-sm text-gray-400 mb-4 uppercase">Escaneie com o app do seu banco</p>
                 <div className="w-48 h-48 bg-white mx-auto mb-6 p-2 flex items-center justify-center border-4 border-gray-700">
                   <img src={pixData.qrCodeURL} alt="QR Code PIX" className="w-full h-full object-contain filter contrast-125" />
                 </div>
                 
                 <div className="mb-6 text-left bg-gray-900 border border-gray-700 p-2 relative group">
                    <p className="text-xs text-gray-500 truncate">{pixData.copyPasteCode}</p>
                    <button onClick={copyPix} className="absolute right-0 top-0 h-full px-4 bg-green-900 hover:bg-green-700 text-white text-xs uppercase font-bold transition-colors">
                      Copiar
                    </button>
                 </div>

                 <button 
                  onClick={handleVerifyPayment}
                  disabled={isVerifying}
                  className="w-full py-3 bg-transparent border-2 border-blue-600 text-blue-500 hover:bg-blue-900 hover:text-white uppercase tracking-widest font-bold transition-all"
                 >
                   {isVerifying ? 'Consultando Webhook (Buscando...)' : 'Verificar Pagamento'}
                 </button>
                 {isVerifying && <p className="text-xs text-blue-400 mt-2 font-pixel blink">Aguardando confirmação da rede...</p>}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- APP ROOT ---
export default function App() {
  const [view, setView] = useState('tickets');
  const [checkoutData, setCheckoutData] = useState({ qty: 0, price: 0, total: 0, lote: 1 });
  
  // Banco de Dados Local Fake
  const [globalTicketsSold, setGlobalTicketsSold] = useState(() => {
    return parseInt(localStorage.getItem('arcade_twc_sold')) || 0;
  });

  const handleContinueToCheckout = (qty, price, total, lote) => {
    setCheckoutData({ qty, price, total, lote });
    setView('checkout');
  };

  const handlePurchaseComplete = (qtyBought) => {
    const newTotal = globalTicketsSold + qtyBought;
    setGlobalTicketsSold(newTotal);
    localStorage.setItem('arcade_twc_sold', newTotal.toString());
    setView('success');
  };

  // Funções Administrativas para Testar a virada de lote (Ocultas/Dev)
  const devInjectTickets = () => {
    const newTotal = globalTicketsSold + 5;
    setGlobalTicketsSold(newTotal);
    localStorage.setItem('arcade_twc_sold', newTotal.toString());
  };
  const devResetDB = () => {
    setGlobalTicketsSold(0);
    localStorage.setItem('arcade_twc_sold', '0');
  };

  return (
    <div className="min-h-screen atmospheric-bg crt relative selection:bg-red-900 selection:text-white">
      <ThemeStyles />
      <div className="fog-bg"></div>
      
      <header className="fixed top-0 w-full p-4 flex justify-between text-xs text-gray-600 font-pixel z-40 pointer-events-none">
        <span>REC 10:31:00</span>
        <span>BATERIA [||| ]</span>
      </header>

      <main className="pt-10 pb-20">
        {view === 'tickets' && <TicketSelection onContinue={handleContinueToCheckout} globalTicketsSold={globalTicketsSold} />}
        {view === 'checkout' && <CheckoutForm onBack={() => setView('tickets')} checkoutData={checkoutData} onPurchaseComplete={handlePurchaseComplete} />}
        
        {view === 'success' && (
          <div className="max-w-2xl mx-auto px-4 py-20 text-center relative z-10">
            <h2 className="text-5xl font-pixel text-red-600 mb-8 glitch" data-text="GAME SAVED">GAME SAVED</h2>
            <div className="p-8 border-y-2 border-gray-600 bg-black/50 text-left font-mono">
              <p className="mb-4 text-gray-400">Recibo transmitido. Pagamento confirmado.</p>
              <p><strong>NOME:</strong> SOBREVIVENTE CLASSIFICADO</p>
              <p><strong>ITEM:</strong> {checkoutData.qty}x LOTE {checkoutData.lote}</p>
              <p><strong>VALOR PAGO:</strong> R$ {checkoutData.total.toFixed(2)} VIA PIX</p>
              <p className="mt-8 text-green-500 blink">"Equipamento adquirido. Te vejo na vila."</p>
            </div>
            <button onClick={() => setView('tickets')} className="mt-12 text-gray-500 hover:text-white underline uppercase text-sm tracking-widest">
              Voltar ao Menu Principal
            </button>
          </div>
        )}
      </main>

      {/* PAINEL DEV - Apenas para você testar a lógica sem DB Real */}
      <div className="fixed bottom-2 right-2 flex gap-2 z-50 opacity-20 hover:opacity-100 transition-opacity">
        <button onClick={devInjectTickets} className="text-[10px] bg-red-900 text-white px-2 py-1">+5 Vendas (Testar Lotes)</button>
        <button onClick={devResetDB} className="text-[10px] bg-gray-800 text-white px-2 py-1">Zerar DB</button>
      </div>
    </div>
  );
}