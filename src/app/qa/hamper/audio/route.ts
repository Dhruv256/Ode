export async function GET() {
  if (process.env.NODE_ENV === "production" || process.env.ODE_QA_MODE !== "true") return new Response(null, { status:404 });
  const samples = 8000, data = Buffer.alloc(44 + samples * 2);
  data.write("RIFF",0); data.writeUInt32LE(data.length-8,4); data.write("WAVEfmt ",8); data.writeUInt32LE(16,16); data.writeUInt16LE(1,20); data.writeUInt16LE(1,22); data.writeUInt32LE(8000,24); data.writeUInt32LE(16000,28); data.writeUInt16LE(2,32); data.writeUInt16LE(16,34); data.write("data",36); data.writeUInt32LE(samples*2,40);
  for (let i=0;i<samples;i++) data.writeInt16LE(Math.round(Math.sin(i/8000*Math.PI*440*2)*1000),44+i*2);
  return new Response(data,{headers:{"content-type":"audio/wav","content-length":String(data.length)}});
}
