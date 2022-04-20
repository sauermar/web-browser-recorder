export const fullPath = (el: any): string => {
  let names = [];
  while (el.parentNode){
    if (el.id){
      names.unshift('#'+el.id);
      break;
    } else {
      if (el==el.ownerDocument.documentElement) {
        names.unshift(el.tagName);
      } else {
        for (var c=1,e=el;e.previousElementSibling;e=e.previousElementSibling,c++);
        names.unshift(el.tagName+":nth-child("+c+")");
      }
      el = el.parentNode;
    }
  }
  return names.join(" > ");
}

export const getPathWithClassNames = (el: Element) : string[]=> {
  let act = el.nodeName;
  el.classList.forEach(cl => act += '.' + cl);
  if (el.id) act += '#' + el.id;

  if (!el.id && el.parentElement) {
    let res = getPathWithClassNames(el.parentElement);
    res.push(act);
    return res;
  } else {
    return [act];
  }
}

