// These headers are supplied by the Sites authenticated dispatcher, never by
// request bodies, query parameters, or browser storage. The current workspace
// runtime forwards authenticated email without a user-id header.
export async function accountKey(headers){
 const email=headers.get('oai-authenticated-user-email')?.trim().toLowerCase();
 if(email){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('fallen-keep:workspace-email:'+email));return 'email:'+Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');}
 return headers.get('oai-authenticated-user-id')?.trim()||null;
}
