(function(){
    var YUI_ONLINE_CONF = {},
        YUI_OFFLINE_CONF = {
            base: "yui3/build/",
            combine:0,
            groups: {
                gallery: {
                    base:'yui3-gallery/build/',
                    patterns:  { 'gallery-': {} }
                }
            }
        },
        ONLINE = (navigator.online) ? true : false; 
        CURRENT_CONF = (ONLINE) ? YUI_ONLINE_CONF : YUI_OFFLINE_CONF;
        
    if(!!window.applicationCache){

    cacheWhatWhat = function(e){
      console.log("event", e);
    }
		    
    cache = window.applicationCache;

    cache.addEventListener('updateready', cacheWhatWhat, false);
    cache.addEventListener('error', cacheWhatWhat, false);
    cache.addEventListener('downloading', cacheWhatWhat, false);
    cache.addEventListener('progress', cacheWhatWhat, false);
    cache.addEventListener('cached', cacheWhatWhat, false);
    }
        

    
    YUI(CURRENT_CONF).use('cssreset','cssgrids','gallery-storage-lite','node','console', function (Y) {

       // For full compatibility with IE 6-7 and Safari 3.x, you should listen for
       // the storage-lite:ready event before making storage calls. If you're not
       // targeting those browsers, you can safely ignore this step.

       var ToDo = {
           // A place to store the todo items
           items: [],

           // start the todo list
           init: function(){
               Y.one("body").on("click",this.onEvent, this);
               Y.one(".item_entry form").on("submit",this.onEvent, this);
               
               this.items = Y.StorageLite.getItem('todo_items', true) || [];
               this.renderItems();
               return true;
           },
           addItem: function(){
               var todo_input = Y.one(".todo_item_input"),
                   todo_text  = todo_input.get("value");

               this.items.push({
                   value:todo_text,
                   state:"todo"
               });
               
               console.log(this.items);
               todo_input.set("value","");
               this.saveItems();
               this.renderItems();

               return true;
           },
           saveItems: function(){
               return Y.StorageLite.setItem('todo_items',this.items, true);
           },
           finishItem: function(target){
               var parent = target.ancestor(".todo_item"),
                   classNames = parent.get("className").split(" "),
                   b,
                   index,
                   new_string;

               for(b in classNames){
                   console.log("index of",classNames[b].indexOf("item__") );
                   if( classNames[b].indexOf("item__") != -1){
                       new_string = classNames[b].replace("item__","");
                       console.log("matching class_name", new_string);
                       index = parseInt(new_string,10);
                   }
               }
               console.log("index",index);
               console.log(this.items);
               this.items[index].state = "done";
               this.saveItems();
               this.renderItems();
               return true;

           },
           // is the todos action handler
           onEvent: function(e){
               var target = e.target,
                   classNames = target.get("className").split(" "),
                   classNamesLength = classNames.length,
                   className;
                   
               e.preventDefault();
               console.log(e);
               console.log("classNames",classNames);
               while(classNamesLength--){
                   className = classNames[classNamesLength];
                   console.log(className);
                   switch (className) {
                       case "entry_form":
                       case "addItem":
                           this.addItem();
                           break;
                       case "done":
                           this.finishItem(target);
                           break;

                   }
               }

               return true;
           },
           // repaints the todo list
           renderItems: function(){
               var b,
                   item,
                   list = Y.one(".todo_items ul"),
                   listParent = list.get("parentNode"),
                   listParentNode = Y.one(listParent),
                   notDoneTasks = 0;

               listParent.removeChild(list);
               listParentNode.insert(Y.Node.create("<ul></ul>"));
               for(b in this.items){
                   item = this.items[b];
                   if (item.state == "done") { continue; }
                   notDoneTasks++;
                   Y.one(".todo_items ul").insert(
                       Y.Node.create(
                           '<li class="todo_item item__'+b+'"><p>'+item.value+"</p><p class=\"actions  toRight\"><a class=\"done\" href=\"javascript:void(0);\">done</a></p></li>"
                       )
                   );
               }
               if(notDoneTasks == 0){
                   Y.one(".todo_items ul").insert(Y.Node.create("<li class=\"no_items\">No Items</li>"));
               }
           }

       };
       
       Y.StorageLite.on('storage-lite:ready', function () {
           ToDo.init();
          /*
          // To store an item, pass a key and a value (both strings) to setItem().
          Y.StorageLite.setItem('kittens', 'fluffy and cute');

          // If you set the optional third parameter to true, you can use any
          // serializable object as the value and it will automatically be stored
          // as a JSON string.
          Y.StorageLite.setItem('pies', ['apple', 'pumpkin', 'pecan'], true);

          // To retrieve an item, pass the key to getItem().
          console.log(Y.StorageLite.getItem('kittens'));    // => 'fluffy and cute'

          // To retrieve and automatically parse a JSON value, set the optional
          // second parameter to true.
          console.log(Y.StorageLite.getItem('pies', true)); // => ['apple', 'pumpkin', 'pecan']

          // The length() method returns a count of how many items are currently
          // stored.
          console.log(Y.StorageLite.length()); // => 2

          // To remove a single item, pass its key to removeItem().
          Y.StorageLite.removeItem('kittens');

          // To remove all items in storage, call clear().
          Y.StorageLite.clear();
          */

       });
    });
    
})();




