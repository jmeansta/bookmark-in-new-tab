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

function traverseTree(bookmarkItem, indent, printingChildren) {
  if (printingChildren) {
    newElement(bookmarkItem,indent)
  }

  if (bookmarkItem.children) {
    indent++;
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

function findInTree(id) {
  // body...
}

function startTraversal(bookmarkItems) {
  traverseTree(bookmarkItems[0], 0, false);
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

async function restoreOptions() {
  const options = await browser.storage.local.get(["selectedFolders"]);
  // console.log(options)
  options.selectedFolders.forEach((id) => newFolder(id));
  // pass the ids of the folders to load to a tree traversal function
  // that function should traverse the tree, looking for folders with those ids
  // and then make folders in the folder div with those names
};

window.addEventListener( 'load', restoreOptions );
let treePromise = browser.bookmarks.getTree();
treePromise.then(startTraversal, onRejected);