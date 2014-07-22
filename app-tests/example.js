// this seems to work better for testing pure Ajax calls than Jasmine 1.x waitsFor method.
var myWaitsFor = function(conditionFunc, execFunc, timeOut) {
    var t, i;

    // will be called if the conditionFunc never returns true
    t = setTimeout(function() {
        clearAll();
        execFunc();
    }, timeOut);
 
    // clearing both timers.
    function clearAll(){
        clearInterval(i);
        clearTimeout(t);
    }
  
    // at 30 milliseconds internal, this is polling for conditionFunc to return true, so that it can
    // clear the timers and run the execFunc() to finalize the loop
    i = setInterval(function() {
        if (conditionFunc()) {
            clearAll();
            execFunc();
        }
    }, 30);
  
};

describe("Basic Ext Assumption", function() {
   it("has ExtJS 4 loaded", function() {
      expect(Ext).toBeDefined();
      expect(Ext.getVersion()).toBeTruthy();
      expect(Ext.getVersion().major).toEqual(4); 
   });
   
   describe("Basic Controller Assumption", function() {
      
      var   UsersController = null, 
            store = null;
      
      beforeEach(function() {
        if(!UsersController) {
            UsersController = Ext.create("AM.controller.Users");
            console.log("UsersController" + UsersController);
            UsersController.init();
        }         
        
        if(!store) {
            // asynchronous exections should be wrapped in a 'runs' function
            // this store has an autoLoad: true, thus will make an ajax call via its proxy.
            runs(function() {
                store = UsersController.getStore("Users");
            });
            
            // this will now wait for the above runs function to execute and will keep polling to check 
            // if our condition will ever turn true, and it will stop after 5000 milliseconds
            waitsFor(function() {
               return (store.getCount() > 0); 
            }, "store not loaded", 5000);
        }
      });
      
      it("Expect UsersController Controller", function() {
          expect(UsersController).toBeTruthy();
      });
      
      it("Expect Users Store", function() {
         expect(store).toBeTruthy(); 
      });
      
      it("Expect 2 items in the store", function() {
         expect(store.getCount()).toEqual(2);
      });
   });
 
 
    describe("Ext.Ajax.request demo", function() {
        var data,
            expectedData = {
                success: true,
                users: [
                    {id: 1, name: 'Ed',    email: 'ed@sencha.com'},
                    {id: 2, name: 'Tommy', email: 'tommy@sencha.com'}
                ]
            };

        function doAjaxCall(callback) {
            Ext.Ajax.request({
                url: "data/users.json",
                success: callback  
            });
        }  
        
        doAjaxCall(function(resp) {
            console.log("is callback being called?");
            data = Ext.decode(resp.responseText);
        });

        myWaitsFor(function() {
            return !Ext.isObject(data);
        }, function() {
           console.log("data is: " + data);
        }, 5000); 
        
        // this doesn't work
        // waitsFor(function() {
            // return !Ext.isObject(data);
        // }, "ajax called failed", 5000);

        it("should make a real AJAX request", function () {
            runs(function() {
                console.log("it data is: " + data);
                expect(data).toEqual(expectedData);
            });
        });
    });  
   
});
