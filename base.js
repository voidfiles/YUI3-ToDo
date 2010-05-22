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
        ONLINE = (navigator.online) ? true : false; 
        CURRENT_CONF = (ONLINE) ? YUI_ONLINE_CONF : YUI_OFFLINE_CONF;
        


    YUI(CURRENT_CONF).use('console', function (Y) {            
        if(DEBUG){
            new Y.Console({ logSource: Y.Global,style:"block" }).render("#debug");
        }
        
        if(!!window.applicationCache){
            // Code from Johnathen Stark
            // Convenience array of status values
            var cacheStatusValues = [],
                cache = window.applicationCache;
                
                
            cacheStatusValues[0] = 'uncached';
            cacheStatusValues[1] = 'idle';
            cacheStatusValues[2] = 'checking';
            cacheStatusValues[3] = 'downloading';
            cacheStatusValues[4] = 'updateready';
            cacheStatusValues[5] = 'obsolete';

            // Listeners for all possible events
            cache.addEventListener('cached', logEvent, false);
            cache.addEventListener('checking', logEvent, false);
            cache.addEventListener('downloading', logEvent, false);
            cache.addEventListener('error', logEvent, false);
            cache.addEventListener('noupdate', logEvent, false);
            cache.addEventListener('obsolete', logEvent, false);
            cache.addEventListener('progress', logEvent, false);
            cache.addEventListener('updateready', logEvent, false);

            // Log every event to the console
            function logEvent(e) {
                var online, status, type, message;
                online = (isOnline()) ? 'yes' : 'no';
                status = cacheStatusValues[cache.status];
                type = e.type;
                message = 'online: ' + online;
                message+= ', event: ' + type;
                message+= ', status: ' + status;
                if (type == 'error' && navigator.onLine) {
                    message+= ' There was an unknown error, check your Cache Manifest.';
                }
                Y.log(message);
            }
            
            function isOnline() {
                return navigator.onLine;
            }

            // Swap in newly download files when update is ready
            cache.addEventListener('updateready', function(e){
                    // Don't perform "swap" if this is the first cache
                    if (cacheStatusValues[cache.status] != 'idle') {
                        cache.swapCache();
                        Y.log('Swapped/updated the Cache Manifest.');
                    }
                }
            , false);

            // These two functions check for updates to the manifest file
            function checkForUpdates(){
                cache.update();
            }
            function autoCheckForUpdates(){
                setInterval(function(){cache.update();}, 10000);
            }
        }
    });
    
        

    
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
                   if( classNames[b].indexOf("item__") != -1){
                       new_string = classNames[b].replace("item__","");
                       index = parseInt(new_string,10);
                   }
               }
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
               while(classNamesLength--){
                   className = classNames[classNamesLength];
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
       
       Y.StorageLite.on('storage-lite:ready', function () { ToDo.init();});
    });
    
})();




