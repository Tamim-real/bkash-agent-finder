'use client';

import React, { useState } from 'react';
import { Search, MapPin, Phone, Store, Loader2, AlertCircle, ArrowUpRight, Copy, Check } from 'lucide-react';

interface AgentData {
  name: string;
  number: string;
  address: string;
  houseNumber: string;
  coordinates: { lat: number; lng: number };
  imageUrl: string;
}

export default function BkashAgentFinder() {
  const [searchQuery, setSearchQuery] = useState<string>('01403051840');
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formatPhoneNumber = (numStr: string) => {
    const clean = numStr.replace(/\D/g, '');
    if (clean.length === 11) {
      return `${clean.slice(0, 5)} ${clean.slice(5)}`;
    }
    return numStr;
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    let targetInput = searchQuery.trim();
    if (!targetInput) return;

    let targetGid = '';
    if (targetInput.includes('gid=')) {
      const match = targetInput.match(/gid=([^&]+)/);
      if (match && match[1]) targetGid = match[1].replace('bkash_agent:bkash_agent:', '');
    } else {
      targetGid = targetInput.replace(/^(88)?0+/, '');
    }

    if (!targetGid) {
      setError('Invalid agent number or link');
      return;
    }

    setLoading(true);
    setError(null);
    setAgent(null);

    try {
      const response = await fetch(`/api/bkash-proxy?gid=${targetGid}`);
      if (!response.ok) throw new Error('Agent not found. Check the number again.');

      const resBody = await response.json();
      
      if (resBody?.data?.feature) {
        const feature = resBody.data.feature;
        const dynamicDisplayNumber = targetInput.includes('gid=') 
          ? `0${targetGid}` 
          : (targetInput.startsWith('0') ? targetInput : `0${targetGid}`);

        setAgent({
          name: feature.name || 'Official bKash Agent',
          number: formatPhoneNumber(dynamicDisplayNumber),
          address: feature.address || 'Address details missing',
          houseNumber: feature.house_number || 'N/A',
          coordinates: {
            lat: feature.coordinates?.lat || 23.77166,
            lng: feature.coordinates?.lng || 90.398331
          },
          imageUrl: feature.image_url || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80'
        });
      } else {
        setError('No active agent found');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 flex flex-col items-center p-4 font-sans">
      <div className="w-full max-w-md space-y-6 pt-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-[#E2136E] rounded-2xl flex items-center justify-center">
              <Store className="text-white" size={22} />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter text-slate-900">bKash Agent Finder</h1>
          </div>
          <p className="text-slate-500 text-sm">Looking for bKash Agent?</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-2">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Agent number or gid link"
                className="w-full pl-14 pr-5 py-4 bg-transparent focus:outline-none text-base placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="bg-[#E2136E] hover:bg-[#c91062] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold px-8 py-4 rounded-2xl transition-all active:scale-95 flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
            </button>
          </form>
        </div>

        {/* Content Area */}
        <div className="min-h-[420px]">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-3xl flex gap-3 items-start">
              <AlertCircle size={22} className="shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {!agent && !error && !loading && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 text-center">
              <div className="w-20 h-20 mx-auto bg-pink-50 rounded-3xl flex items-center justify-center mb-6">
                <Store size={42} className="text-[#E2136E]" />
              </div>
              <h3 className="font-semibold text-xl text-slate-800">Find bKash Agent</h3>
              <p className="text-slate-500 mt-2">Enter agent number to verify identity & location</p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-slate-200 rounded-2xl shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-slate-200 rounded-xl w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded-xl w-1/3"></div>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="h-4 bg-slate-200 rounded-xl w-full"></div>
                <div className="h-4 bg-slate-200 rounded-xl w-5/6"></div>
              </div>
            </div>
          )}

          {agent && !loading && (
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/70 border border-slate-100 space-y-6">
              
              {/* User-Friendly Identity Header Row */}
              <div className="flex items-start gap-4">
                {/* Scaled-down, beautifully framed micro-preview */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border-2 border-white ring-4 ring-pink-50 shadow-inner shrink-0">
                  <img
                    src={agent.imageUrl}
                    alt={agent.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80";
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Dynamic Title and Live Badge placement */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-xl text-[10px] font-bold text-emerald-700">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Authorized
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-snug break-words">
                    {agent.name}
                  </h2>
                </div>
              </div>

              {/* Quick Contact Interactive Row */}
              <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4">
                <div className="w-11 h-11 bg-[#E2136E]/10 rounded-xl flex items-center justify-center text-[#E2136E]">
                  <Phone size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-medium">AGENT NUMBER</p>
                  <p className="font-mono font-semibold text-lg text-slate-800 tracking-tight">{agent.number}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(agent.number.replace(/\s/g, ''))}
                  className="p-3 hover:bg-white border border-transparent hover:border-slate-100 rounded-xl transition-all shadow-sm bg-white sm:bg-transparent"
                  title="Copy Number"
                >
                  {copied ? <Check className="text-emerald-500" size={20} /> : <Copy size={20} />}
                </button>
              </div>

              {/* Data Specifications Grid */}
              <div className="space-y-4 pt-1">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                    <Store size={18} />
                  </div>
                  <div>
                    <p className="uppercase text-[10px] font-bold tracking-widest text-slate-400">House</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{agent.houseNumber}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="uppercase text-[10px] font-bold tracking-widest text-slate-400">Shop Address</p>
                    <p className="text-slate-600 font-medium leading-relaxed mt-0.5">{agent.address}</p>
                  </div>
                </div>
              </div>

              {/* CTA Navigation Routing Matrix */}
              <div className="pt-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${agent.coordinates.lat},${agent.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-slate-900 hover:bg-black active:scale-[0.985] transition-all text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                >
                  <span>Open in Google Maps</span>
                  <ArrowUpRight size={20} />
                </a>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}