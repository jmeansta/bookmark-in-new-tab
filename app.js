function $(id) {return document.getElementById(id)}

function watchOverflow(el) {
  function update() {
    const overflowing = el.scrollWidth > el.clientWidth;// || el.scrollHeight > el.clientHeight;
    el.classList.toggle("is-overflowing", overflowing);
  }

  // Run once initially
  update();

  // Watch for size changes
  const resizeObserver = new ResizeObserver(update);
  resizeObserver.observe(el);
}

function displayOptionsPrompt(argument) {
  var div = document.createElement("div")
  var label = document.createElement("p")
  var img = document.createElement("img")

  img.src = "icons/settings.svg"
  img.classList.add("iconNeedsScaling")
  div.appendChild(img)

  label.innerHTML = "Add bookmarks";
  div.appendChild(label)

  // div.dataset.bookmarkItem = bookmarkItem.id
  // folder.id = `bmid${bookmarkItem.id}`
  div.addEventListener('click', function(){openOptions()})
  div.id = "selectedFolder"
  $("savedFolders").appendChild(div)
  // body...
  function openOptions() {
    function onOpened() {console.log(`Options page opened`);}
    function onError(error) {console.log(`Error: ${error}`);}

    let opening = browser.runtime.openOptionsPage();
    opening.then(onOpened, onError);
  }
}



function displayFolderBookmarks(bmFolderElm) {
  if ($("selectedFolder")==null) {
    bmFolderElm.id = "selectedFolder"
  } else {
    $("selectedFolder").removeAttribute("id");
    bmFolderElm.id = "selectedFolder"
  }

  var bmid = bmFolderElm.dataset.bookmarkItem
  while ($("nestedBookmarks").firstChild) {
      $("nestedBookmarks").removeChild($("nestedBookmarks").firstChild);
  }
  treePromise.then((tree) => startTraversal_nestedBookmarks (tree,bmid), onRejected)
}

function newBookmark(bookmarkItem) {
  var div = document.createElement("div")
  var label = document.createElement("p")
  var img = document.createElement("img")

  img.src = "icons/star.svg"
  img.classList.add("iconNeedsScaling")
  div.appendChild(img)

  label.innerHTML = bookmarkItem.title;
  div.appendChild(label)

  // div.dataset.bookmarkItem = bookmarkItem.id
  div.dataset.linkTo = bookmarkItem.url
  // folder.id = `bmid${bookmarkItem.id}`
  div.addEventListener('click', function(){window.open(this.dataset.linkTo,"_self")})
  $("savedBookmarks").appendChild(div)
}

function newNestedBookmark(bookmarkItem,indent=0) {
  var elm = document.createElement("p");
  elm.innerHTML = "bookmarkItem with no URL passed to newNestedBookmark"
  if (bookmarkItem.url == "data:") {
    elm = document.createElement("hr"); // separators
    elm.align = "right";
    elm.width = $("nestedBookmarks").clientWidth-indent*40 + "px";
  } else if (bookmarkItem.url) {
    elm = document.createElement("a"); // bookmarks
    elm.href = bookmarkItem.url;
    elm.innerHTML = bookmarkItem.title;
    // elm.innerHTML = indent.toString()+" - "+bookmarkItem.title+" ("+bookmarkItem.id+")";
    elm.title = indent.toString()+" - "+bookmarkItem.id;
    elm.style = "margin: 0px; margin-left: " + indent*40 + "px;"
  }
  $("nestedBookmarks").appendChild(elm)
}

function newFolder(bookmarkItem) {
  var folder = document.createElement("div")
  var label = document.createElement("p")
  var img = document.createElement("img")

  img.src = "icons/folder.svg"
  img.classList.add("iconNeedsScaling")
  folder.appendChild(img)

  label.innerHTML = bookmarkItem.title;
  folder.appendChild(label)

  folder.dataset.bookmarkItem = bookmarkItem.id
  // folder.id = `bmid${bookmarkItem.id}`
  folder.addEventListener('click', function(){displayFolderBookmarks(this)})
  $("savedFolders").appendChild(folder)
}

function onRejected(error) {
  var elm = document.createElement("p");
  elm.innerHTML = `An error occured: ${error}`
  $("bmDiv").appendChild(elm)
}

function traverseTree_savedFolders(bookmarkItem,selectedBmNodes,isRoot) {
  if (bookmarkItem.children) {
    selectedBmNodes.forEach(function(id) {if (bookmarkItem.id == id) {newFolder(bookmarkItem)}});
    for (const child of bookmarkItem.children) {
      traverseTree_savedFolders(child,selectedBmNodes,false);
    }
  } else {
    selectedBmNodes.forEach(function(id) {if (bookmarkItem.id == id) {newBookmark(bookmarkItem)}});
  }
  if (isRoot) {
    // run when recursion has finished
    var collection = document.getElementsByClassName("iconNeedsScaling");
    for (var k = 0; k < collection.length; k++) {
      var imageHeight = 0
      imageHeight += collection[k].parentElement.clientHeight;
      imageHeight -= collection[k].parentElement.children[1].clientHeight;
      imageHeight -= 2*Number.parseFloat(window.getComputedStyle(collection[k].parentNode, null).getPropertyValue('padding'));
      collection[k].height = imageHeight;
    }
    displayFolderBookmarks($("savedFolders").firstChild)
  }
}

function traverseTree_folderContents(bookmarkItem,bmid,isChild) {
  if (isChild && bookmarkItem.url) {
    newNestedBookmark(bookmarkItem)
  }

  if (bookmarkItem.children) {
    for (const child of bookmarkItem.children) {
      // if (isChild || bookmarkItem.id == bmid) { //show children and nested children
      if (bookmarkItem.id == bmid) { // only show the direct children
        traverseTree_folderContents(child, bmid, true);
      } else {
        traverseTree_folderContents(child, bmid, false);
      }
    }
  }
}

async function startTraversal_savedFolders(bookmarkItems) {
  const options = await browser.storage.local.get(["selectedBmNodes"]);
  if (options.selectedBmNodes.length == 0) {
    displayOptionsPrompt()
  } else {
    traverseTree_savedFolders(bookmarkItems[0],options.selectedBmNodes,true);
  }
}

function startTraversal_nestedBookmarks(bookmarkItems,bmid) {
  traverseTree_folderContents(bookmarkItems[0],bmid,false)
}

let treePromise = browser.bookmarks.getTree();
treePromise.then(startTraversal_savedFolders, onRejected);

document.querySelectorAll(".dividerBox").forEach(watchOverflow);



// displayFolderBookmarks($("bookmarkFolders").firstChild.dataset.bookmarkItem)

