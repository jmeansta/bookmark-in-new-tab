function $(id) {return document.getElementById(id)}

function newElement(bookmarkItem,indent) {
  if (bookmarkItem.url) {
    var elm = document.createElement("a"); // bookmarks
    elm.href = bookmarkItem.url;
  } else {
    var elm = document.createElement("p"); // folders
  }
  elm.innerHTML = bookmarkItem.title;
  // elm.innerHTML = indent.toString()+" - "+bookmarkItem.title+" ("+bookmarkItem.id+")";
  elm.title = indent.toString()+" - "+bookmarkItem.id;
  elm.style = "margin: 0px; margin-left: " + indent*40 + "px;"

  if (bookmarkItem.url == "data:") {
    // horizontal rules turn into boxes when they have innerHTML
    // I elected to just overwrite the "elm" variable in this case
    var elm = document.createElement("hr"); // separators
    elm.align = "right";
    elm.width = $("bookmarkBar").clientWidth-indent*40 + "px";
  }
  $("bookmarkBar").appendChild(elm)
}

function onRejected(error) {
  var elm = document.createElement("p");
  elm.innerHTML = `An error occured: ${error}`
  $("bmDiv").appendChild(elm)
}

function newFolder(id) {
  var folder = document.createElement("p")
  folder.innerHTML = id;
  // folder.onclick = displaySubnodes(id)
  $("bookmarkFolders").appendChild(folder)
}

async function startTraversalToRestoreFolders(bookmarkItems) {
  traverseTreeToRestoreFolders(bookmarkItems[0]);
}

async function traverseTreeToRestoreFolders(bookmarkItem) {
  const options = await browser.storage.local.get(["selectedFolders"]);

  options.selectedFolders.forEach(function(id) {if (bookmarkItem.id == id) {newFolder(bookmarkItem.title)}});
  
  if (bookmarkItem.children) {
    for (const child of bookmarkItem.children) {
      traverseTreeToRestoreFolders(child);
    }
  }
}

let treePromise = browser.bookmarks.getTree();
treePromise.then(startTraversalToRestoreFolders, onRejected);