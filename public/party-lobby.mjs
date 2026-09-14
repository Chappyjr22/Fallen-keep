export const lobbyStamp=(host,guest,mapId)=>`${host?.lobbyRevision||0}:${mapId}:${host?.character||''}:${guest?.character||''}`;
