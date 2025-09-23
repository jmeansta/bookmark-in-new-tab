function $(id) {return document.getElementById(id)}

function newElement(bookmarkItem,indent=0) {
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

function newFolder(bookmarkItem) {
  var folder = document.createElement("p")
  folder.innerHTML = bookmarkItem.title;
  folder.dataset.bookmarkItem = bookmarkItem.id
  folder.addEventListener('click', function(){displaySubnodes(this.dataset.bookmarkItem)})
  $("bookmarkFolders").appendChild(folder)
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
  if (isChild) {
    newElement(bookmarkItem)
  }

  if (bookmarkItem.children) {
    for (const child of bookmarkItem.children) {
      if (isChild || bookmarkItem.id == bmid) {
        traverseTree_folderContents(child, bmid, true);
      } else {
        traverseTree_folderContents(child, bmid, false);
      }
    }
  }
  // console.log(`id: ${bookmarkItem.id}`)
  // console.log(`bmid: ${bmid}`)
  // return

  // if (bookmarkItem.children) {
  //   for (const child of bookmarkItem.children) {
  //     traverseTree_folderContents(child);
  //   }
  // }

  // if (bookmarkItem.id == bmid) {

  // }
}

async function startTraversal_savedFolders(bookmarkItems) {
  traverseTree_savedFolders(bookmarkItems[0]);
}

function startTraversal_folderContents(bookmarkItems,bmid) {
  traverseTree_folderContents(bookmarkItems[0],bmid)
}

function displaySubnodes(bmid) {
  console.log(bmid)
  treePromise.then((tree) => startTraversal_folderContents (tree,bmid), onRejected)
}

let treePromise = browser.bookmarks.getTree();
treePromise.then(startTraversal_savedFolders, onRejected);