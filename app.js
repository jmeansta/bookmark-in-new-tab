function $(id) {return document.getElementById(id)}
function err(message) {
  $("errorText").innerHTML = message;
  $("errorText").style = "color: red;"
}
function newLi(text,indent) {
  var elm = document.createElement("li")
  elm.innerHTML = text
  elm.style = "text-indent: " + indent*20 + "px;"
  $("bmList").appendChild(elm)
}

function newItem(text,indent,path=null) {
  if (path == null) {
    var elm = document.createElement("p");
  } else {
    var elm = document.createElement("a");
    elm.href = path;
  }
  elm.innerHTML = indent.toString()+" - "+text;
  elm.style = "text-indent: " + indent*3 + "em;"
  $("bmDiv").appendChild(elm)
}

function printItems(bookmarkItem, indent) {
  if (bookmarkItem.url) {
    newItem(bookmarkItem.title,indent,bookmarkItem.url);
  } else {
    newItem(bookmarkItem.title,indent);
    indent++;
    if (bookmarkItem.children) {
      for (const child of bookmarkItem.children) {
        printItems(child, indent);
      }
    }
    indent--;
  }
}

function printTree(bookmarkItems) {
  printItems(bookmarkItems[0], 0);
}

function onRejected(error) {
  newFold(`An error: ${error}`,0);
}

let treePromise = browser.bookmarks.getTree();
treePromise.then(printTree, onRejected);
