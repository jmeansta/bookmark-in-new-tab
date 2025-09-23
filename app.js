function $(id) {return document.getElementById(id)}

function newBookmark(bookmarkItem,indent=0) {
  var elm = document.createElement("p");
  elm.innerHTML = "bookmarkItem with no URL passed to newBookmark"
  if (bookmarkItem.url == "data:") {
    elm = document.createElement("hr"); // separators
    elm.align = "right";
    elm.width = $("bookmarkBar").clientWidth-indent*40 + "px";
  } else if (bookmarkItem.url) {
    elm = document.createElement("a"); // bookmarks
    elm.href = bookmarkItem.url;
    elm.innerHTML = bookmarkItem.title;
    // elm.innerHTML = indent.toString()+" - "+bookmarkItem.title+" ("+bookmarkItem.id+")";
    elm.title = indent.toString()+" - "+bookmarkItem.id;
    elm.style = "margin: 0px; margin-left: " + indent*40 + "px;"
  }
  $("bookmarkBar").appendChild(elm)
  
}

function displayFolderBookmarks(bmFolderElm) {
  var bmid = bmFolderElm.dataset.bookmarkItem
  while ($("bookmarkBar").firstChild) {
      $("bookmarkBar").removeChild($("bookmarkBar").firstChild);
  }
  treePromise.then((tree) => startTraversal_folderContents (tree,bmid), onRejected)
}

function newFolder(bookmarkItem) {
  var folder = document.createElement("p")
  folder.innerHTML = bookmarkItem.title;
  folder.dataset.bookmarkItem = bookmarkItem.id
  // folder.id = `bmid${bookmarkItem.id}`
  folder.addEventListener('click', function(){displayFolderBookmarks(this)})
  $("bookmarkFolders").appendChild(folder)
}

function onRejected(error) {
  var elm = document.createElement("p");
  elm.innerHTML = `An error occured: ${error}`
  $("bmDiv").appendChild(elm)
}

async function traverseTree_savedFolders(bookmarkItem) {
  const options = await browser.storage.local.get(["selectedFolders"]);

  options.selectedFolders.forEach(function(id) {if (bookmarkItem.id == id) {newFolder(bookmarkItem)}});
  
  if (bookmarkItem.children) {
    for (const child of bookmarkItem.children) {
      traverseTree_savedFolders(child);
    }
  }
  
}

async function traverseTree_folderContents(bookmarkItem,bmid,isChild) {
  if (isChild && bookmarkItem.url) {
    newBookmark(bookmarkItem)
  }

  if (bookmarkItem.children) {
    for (const child of bookmarkItem.children) {
      // if (isChild || bookmarkItem.id == bmid) {
      if (bookmarkItem.id == bmid) {
        traverseTree_folderContents(child, bmid, true);
      } else {
        traverseTree_folderContents(child, bmid, false);
      }
    }
  }
}

async function startTraversal_savedFolders(bookmarkItems) {
  traverseTree_savedFolders(bookmarkItems[0]);
}

function startTraversal_folderContents(bookmarkItems,bmid) {
  traverseTree_folderContents(bookmarkItems[0],bmid)
}

let treePromise = browser.bookmarks.getTree();
treePromise.then(startTraversal_savedFolders, onRejected);

// displayFolderBookmarks($("bookmarkFolders").firstChild.dataset.bookmarkItem)

