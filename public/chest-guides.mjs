// Project world positions into the camera's visible rectangle, then pin distant
// chests inside the usable screen area. Separate markers sharing an edge.
export function chestGuides(points,view,width,height,top=100){
 const left=42,right=Math.max(left,width-42),bottom=Math.max(top+20,height-48),cx=width/2,cy=(top+bottom)/2,used=[];
 return points.map(p=>{const sx=(p.x-view.x)*width/view.width,sy=(p.y-view.y)*height/view.height;
 const visible=sx>=24&&sx<=width-24&&sy>=24&&sy<=height-24;
 if(visible)return {x:sx,y:Math.max(26,sy-52),angle:Math.PI/2,edge:false};
 const dx=sx-cx,dy=sy-cy,t=Math.min(dx?((dx>0?right:left)-cx)/dx:Infinity,dy?((dy>0?bottom:top)-cy)/dy:Infinity);
 let x=Math.max(left,Math.min(right,cx+dx*t)),y=Math.max(top,Math.min(bottom,cy+dy*t));const horizontal=Math.abs(y-top)<1||Math.abs(y-bottom)<1,baseX=x,baseY=y;
 for(let step=0;step<80&&used.some(q=>Math.hypot(q.x-x,q.y-y)<32);step++){const shift=(Math.floor(step/2)+1)*34*(step%2?-1:1);x=horizontal?Math.max(left,Math.min(right,baseX+shift)):Math.max(left,Math.min(right,baseX+(baseX<cx?1:-1)*Math.floor(step/12)*32));y=horizontal?Math.max(top,Math.min(bottom,baseY+(baseY<cy?1:-1)*Math.floor(step/12)*32)):Math.max(top,Math.min(bottom,baseY+shift));}
 used.push({x,y});return {x,y,angle:Math.atan2(sy-y,sx-x),edge:true};
 });
}
