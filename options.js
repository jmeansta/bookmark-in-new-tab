function $(id) {return document.getElementById(id)}

function idAndIndent(n,bookmarkItem,indent) {
  if (bookmarkItem.id=="root________" || bookmarkItem.id=="menu________") {
    console.log(n.toString()+bookmarkItem.id+indent.toString())
  }
}

function newElement(bookmarkItem,indent) {
  if (bookmarkItem.url) {
    return // removes individual bookmarks and smart options like "Most Visited"
  }
  var rowItem = document.createElement("div");
  var input = document.createElement("input");
  var label = document.createElement("label");

  input.type = "checkbox";
  input.id = bookmarkItem.id;
  rowItem.appendChild(input)

  label.innerHTML = bookmarkItem.title;
  label.htmlFor = bookmarkItem.id;
  rowItem.appendChild(label)

  rowItem.title = indent.toString()+" - "+bookmarkItem.id;
  rowItem.style = "margin: 0px; margin-left: " + indent*40 + "px;"

  if (bookmarkItem.url == "data:") {
    // horizontal rules turn into boxes when they have innerHTML
    // I elected to just overwrite the "rowItem" variable in this case
    var rowItem = document.createElement("hr"); // separators
    rowItem.align = "right";
    rowItem.width = $("bmForm").clientWidth-indent*40 + "px";
  }
  $("bmForm").appendChild(rowItem)
}

function traverseTree(bookmarkItem, indent, printingChildren) {
  if (printingChildren) {
    newElement(bookmarkItem,indent)
  }

  if (bookmarkItem.children) {
    if (bookmarkItem.id != "root________") {
      indent++;
    }
    for (const child of bookmarkItem.children) {
      // if (printingChildren || bookmarkItem.id == "toolbar_____") {
      if (printingChildren || bookmarkItem.id == "root________") {
        traverseTree(child, indent, true);
      } else {
        traverseTree(child, indent, false);
      }
    }
    indent--;
  }
  
}

function startTraversal(bookmarkItems) {
  traverseTree(bookmarkItems[0], 0, false);
}

function onRejected(error) {
  var err = document.createElement("p");
  err.innerHTML = `An error occured: ${error}`
  $("bmForm").appendChild(err)
}

let treePromise = browser.bookmarks.getTree();
try {
  treePromise.then(startTraversal, onRejected);
} catch(e) {
  alert(e)
}