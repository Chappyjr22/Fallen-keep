// ChatGPT Sites supplies authenticated identity headers. Standalone Cloudflare
// deployments do not, so fall back to a durable browser-generated UUID header.
// The Sites identity always wins when present, preserving existing behavior there.
export async function accountKey(headers){
 const email=headers.get('oai-authenticated-user-email')?.trim().toLowerCase();
 if(email){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('fallen-keep:workspace-email:'+email));return 'email:'+Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');}
 const authenticated=headers.get('oai-authenticated-user-id')?.trim();
 if(authenticated)return authenticated;
 const device=headers.get('x-fallen-keep-player')?.trim().toLowerCase();
 if(device&&/^[a-f0-9-]{36}$/.test(device))return 'device:'+device;
 return null;
}
