(function(){
    var DEBUG = 1,
        YUI_ONLINE_CONF = {
            debug:DEBUG
        },
        YUI_OFFLINE_CONF = {
            base: "yui3/build/",
            combine:0,
            groups: {
                gallery: {
                    base:'yui3-gallery/build/',
                    patterns:  { 'gallery-': {} }
                }
            },
            debug:DEBUG
        },
        ONLINE = navigator.onLine,
        CURRENT_CONF;
    
    if(ONLINE){
        CURRENT_CONF = YUI_ONLINE_CONF;
    } else {
        CURRENT_CONF = YUI_OFFLINE_CONF;
    }


    YUI(CURRENT_CONF).use('console', function (Y) {
        if(DEBUG){
            new Y.Console({ logSource: Y.Global,style:"block" }).render("#debug");
        }
        
        
        if(!!window.applicationCache){
            cache = window.applicationCache;
            cacheEventHandler = function(e){
                var type = e.type,
                    this.calledUpdate = this.calledUpdate || false,
                    this.cache = this.cache || cache,
                    message;
                    
                switch(type){
                    case "updateready":
                        if(this.calledUpdate){
                            this.cache.swapCache();
                            this.calledUpdate = false;
                            message = "Swapped the cache, now we probably need to reload.";
                        } else {
                            this.cache.update();
                            message = "Called update now we need to wait for updateready again to swap the cache.";
                        }
                        break;
                    case "error":
                        message = "An error has occured, check your manifest.";
                        break
                    default:
                        messsage = "A " + type + " event has occured";
                        break;
                        
                }
                
                if(typeof Y.log !== "undefined"){
                    Y.log(message);
                } elseif(typeof console.log !== "undefined") {
                    console.log(message)
                }
                
                return message;
            };
		    
            

            cache.addEventListener('updateready', cacheEventHandler, false);
            cache.addEventListener('error', cacheEventHandler, false);
            cache.addEventListener('downloading', cacheEventHandler, false);
            cache.addEventListener('progress', cacheEventHandler, false);
            cache.addEventListener('cached', cacheEventHandler, false);
        }
        Y.log("testing");
    });
    
        

    
    YUI(CURRENT_CONF).use('cssreset','cssgrids','gallery-storage-lite','node','console', function (Y) {

       // For full compatibility with IE 6-7 and Safari 3.x, you should listen for
       // the storage-lite:ready event before making storage calls. If you're not
       // targeting those browsers, you can safely ignore this step.
       
       Y.log("testing 2");
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
               
               Y.log(this.items);
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
                   Y.log("index of",classNames[b].indexOf("item__") );
                   if( classNames[b].indexOf("item__") != -1){
                       new_string = classNames[b].replace("item__","");
                       Y.log("matching class_name", new_string);
                       index = parseInt(new_string,10);
                   }
               }
               Y.log("index",index);
               Y.log(this.items);
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
               Y.log(e);
               Y.log("classNames",classNames);
               while(classNamesLength--){
                   className = classNames[classNamesLength];
                   Y.log(className);
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




