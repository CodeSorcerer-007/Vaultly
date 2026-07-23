"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Copy, Send, Loader2, CheckCircle2 } from "lucide-react";
import type Peer from "peerjs";
import { VFSItem, addVFSFile, getVFSFiles } from "@/lib/vfsStorage";

interface VaultDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  filesToShare?: VFSItem[];
  onFilesReceived?: () => void;
}

export default function VaultDropModal({
  isOpen,
  onClose,
  filesToShare = [],
  onFilesReceived
}: VaultDropModalProps) {
  const [peerId, setPeerId] = useState<string>("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [status, setStatus] = useState<"initializing" | "ready" | "connecting" | "connected">("initializing");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  
  const peerRef = useRef<Peer>();
  const connectionRef = useRef<any>();

  useEffect(() => {
    if (!isOpen) return;

    const initPeer = async () => {
      setStatus("initializing");
      try {
        // dynamic import for SSR compatibility in Next.js
        const { default: PeerClass } = await import("peerjs");
        const newPeer = new PeerClass();
        
        newPeer.on("open", (id) => {
          setPeerId(id);
          setStatus("ready");
        });

        newPeer.on("connection", (conn) => {
          connectionRef.current = conn;
          setStatus("connected");
          setMessages((prev) => [...prev, { sender: "system", text: "Connected to a peer!" }]);

          conn.on("data", (data: any) => {
            if (data.type === "file") {
              setMessages((prev) => [...prev, { sender: "peer", text: `Received file: ${data.name}` }]);
              addVFSFile({
                name: data.name,
                size: data.size,
                mimeType: data.mimeType || "application/octet-stream",
                content: data.content,
                storageDrive: "internal"
              });
              if (onFilesReceived) onFilesReceived();
            }
          });
          
          conn.on("close", () => {
            setStatus("ready");
            setMessages((prev) => [...prev, { sender: "system", text: "Peer disconnected." }]);
          });
        });

        peerRef.current = newPeer;
      } catch (err) {
        console.error("Failed to init peer", err);
        setMessages([{ sender: "system", text: "Failed to initialize P2P networking." }]);
      }
    };

    initPeer();

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [isOpen]);

  const connectToPeer = () => {
    if (!peerRef.current || !remotePeerId.trim()) return;
    setStatus("connecting");
    
    const conn = peerRef.current.connect(remotePeerId);
    connectionRef.current = conn;
    
    conn.on("open", () => {
      setStatus("connected");
      setMessages((prev) => [...prev, { sender: "system", text: "Connected!" }]);
      
      // Auto-send files if opened with selection
      if (filesToShare.length > 0) {
        filesToShare.forEach(file => {
          conn.send({
            type: "file",
            name: file.name,
            size: file.size,
            mimeType: file.mimeType,
            content: file.content
          });
          setMessages((prev) => [...prev, { sender: "you", text: `Sent file: ${file.name}` }]);
        });
      }
    });

    conn.on("data", (data: any) => {
      if (data.type === "file") {
        setMessages((prev) => [...prev, { sender: "peer", text: `Received file: ${data.name}` }]);
        addVFSFile({
          name: data.name,
          size: data.size,
          mimeType: data.mimeType || "application/octet-stream",
          content: data.content,
          storageDrive: "internal"
        });
        if (onFilesReceived) onFilesReceived();
      }
    });
    
    conn.on("close", () => {
      setStatus("ready");
      setMessages((prev) => [...prev, { sender: "system", text: "Peer disconnected." }]);
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(peerId);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-[var(--bg-main)] text-[var(--text-primary)] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-700/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">VaultDrop</h3>
                <p className="text-xs text-slate-500">Secure Offline P2P Transfer</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {status === "initializing" && (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-sm text-slate-400">Initializing Local Network...</p>
              </div>
            )}

            {(status === "ready" || status === "connecting" || status === "connected") && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col items-center text-center space-y-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Your Vault ID</span>
                  <div className="text-2xl font-mono font-bold text-indigo-400 select-all">
                    {peerId}
                  </div>
                  <button onClick={copyToClipboard} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors">
                    <Copy className="w-3.5 h-3.5" /> Copy ID
                  </button>
                </div>

                {status !== "connected" ? (
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-slate-400 pl-1">Connect to a Device</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={remotePeerId}
                        onChange={(e) => setRemotePeerId(e.target.value)}
                        placeholder="Enter Remote Vault ID..."
                        className="flex-1 bg-slate-800/80 border border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-colors font-mono"
                      />
                      <button
                        onClick={connectToPeer}
                        disabled={!remotePeerId.trim() || status === "connecting"}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                      >
                        {status === "connecting" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-400 bg-emerald-500/10 py-2 rounded-xl">
                      <CheckCircle2 className="w-4 h-4" /> Connected to Peer
                    </div>
                    
                    <div className="h-40 overflow-y-auto bg-slate-900/50 rounded-xl p-3 text-xs font-mono space-y-2 border border-slate-800">
                      {messages.map((m, i) => (
                        <div key={i} className={`${m.sender === 'system' ? 'text-slate-500' : m.sender === 'you' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                          <span className="opacity-50">[{m.sender}]</span> {m.text}
                        </div>
                      ))}
                      {messages.length === 0 && <div className="text-slate-600 text-center py-4">No transfer activity yet.</div>}
                    </div>

                    {filesToShare.length > 0 && (
                      <p className="text-xs text-slate-400 text-center">
                        {filesToShare.length} file(s) automatically sent.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
