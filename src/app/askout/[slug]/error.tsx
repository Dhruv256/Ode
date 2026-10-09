"use client";

export default function AskOutError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main style={{minHeight:"100dvh",display:"grid",placeItems:"center",padding:24,background:"#ebe8df",color:"#171815"}}><section style={{maxWidth:440,padding:32,border:"1px solid #8f8d85",background:"#fffdf7",boxShadow:"7px 7px 0 #171815"}}><p style={{fontSize:11,textTransform:"uppercase",letterSpacing:".12em"}}>Tiny technical intermission</p><h1 style={{fontSize:42,lineHeight:1,margin:"18px 0"}}>The message dropped its context.</h1><p>The link is still here. The internet just needs another attempt.</p><button onClick={reset} style={{minHeight:48,marginTop:16,padding:"12px 18px",border:0,background:"#171815",color:"#fffdf7",fontWeight:700}}>Try again</button></section></main>;
}
