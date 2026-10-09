export const scrollEnabled=(preference,reduced)=>preference!=='off';
export const scrollPosition=(from,to,progress)=>from+(to-from)*(progress<.5?4*progress**3:1-(-2*progress+2)**3/2);
export function activeSection(sections,{viewportHeight,headerHeight,scrollY,scrollHeight}){
 if(!sections.length)return null;
 if(scrollY>0&&scrollY+viewportHeight>=scrollHeight-2)return sections.at(-1).id;
 const marker=headerHeight+(viewportHeight-headerHeight)*.5;
 return sections.filter(section=>section.top<=marker).at(-1)?.id||null;
}
