import test from 'node:test';
import assert from 'node:assert/strict';
import {frameMenu} from '../public/compact-menus.mjs';
// Minimal tree adapter tests node identity and exact restoration, not CSS geometry.
function fixture(){
 class Node{
  constructor(name){this.name=name;this.childNodes=[];this.ownerDocument=doc;this.classList={add(){},remove(){}};}
  append(...nodes){for(const n of nodes){if(n.parent)n.parent.childNodes.splice(n.parent.childNodes.indexOf(n),1);n.parent=this;this.childNodes.push(n);}}
  before(node){const p=this.parent;p.childNodes.splice(p.childNodes.indexOf(this),0,node);node.parent=p;}
  replaceWith(node){const p=this.parent;if(node.parent)node.parent.childNodes.splice(node.parent.childNodes.indexOf(node),1);p.childNodes.splice(p.childNodes.indexOf(this),1,node);node.parent=p;this.parent=null;}
  replaceChildren(...nodes){for(const n of this.childNodes)n.parent=null;this.childNodes=[];this.append(...nodes);}
 }
 const doc={createElement:name=>new Node(name),createComment:name=>new Node(name)};
 const panel=new Node('panel'),heading=new Node('heading'),body=new Node('body'),button=new Node('button'),actions=new Node('actions');
 panel.append(heading,body,actions);actions.append(button);
 panel.querySelector=s=>s.includes('> h2')?heading:null;
 panel.querySelectorAll=()=>[actions];
 return {panel,heading,body,button,actions,Node};
}
test('framed menus retain action handlers and restore exact desktop node order',()=>{
 const {panel,heading,body,button,actions}=fixture();const original=[...panel.childNodes];let clicks=0;button.onclick=()=>clicks++;
 const restore=frameMenu(panel);assert.equal(panel.childNodes.length,3);const [head,scroll,foot]=panel.childNodes;
 assert.equal(heading.parent,head);assert.equal(body.parent,scroll);assert.equal(actions.parent,foot);button.onclick();assert.equal(clicks,1);
 restore();assert.deepEqual(panel.childNodes,original);assert.equal(button.parent,actions);button.onclick();assert.equal(clicks,2);
});
test('nested character continuation returns to its original desktop location',()=>{
 const {panel,body,button,Node}=fixture();const detail=new Node('detail');body.append(detail);detail.append(button);
 const original=panel.querySelector;panel.querySelector=s=>s==='.setup-launch, .setup-next'?button:original(s);
 const restore=frameMenu(panel);assert.equal(button.parent,panel.childNodes[2]);restore();assert.equal(button.parent,detail);assert.equal(detail.parent,body);
});
