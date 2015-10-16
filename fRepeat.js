/*
	                                                                                                   
	                        __.....__   _________   _...._            __.....__                        
	     _.._           .-''         '. \        |.'      '-.     .-''         '.                      
	   .' .._|.-,.--.  /     .-''"'-.  `.\        .'```'.    '.  /     .-''"'-.  `.               .|   
	   | '    |  .-. |/     /________\   \\      |       \     \/     /________\   \    __      .' |_  
	 __| |__  | |  | ||                  | |     |        |    ||                  | .:--.'.  .'     | 
	|__   __| | |  | |\    .-------------' |      \      /    . \    .-------------'/ |   \ |'--.  .-' 
	   | |    | |  '-  \    '-.____...---. |     |\`'-.-'   .'   \    '-.____...---.`" __ | |   |  |   
	   | |    | |       `.             .'  |     | '-....-'`      `.             .'  .'.''| |   |  |   
	   | |    | |         `''-...... -'   .'     '.                 `''-...... -'   / /   | |_  |  '.' 
	   | |    |_|                       '-----------'                               \ \._,\ '/  |   /  
	   |_|                                                                           `--'  `"   `'-'   


 fRepeat directive, f****** fast repeat, faster considering ngRepeat.
 currently it will only repeats over an array 'itemAlias in arrayName'
 Author: Aslam Ahammed
*/
(function(angular, window, undefined) {
	'use strict';

	var fRepeat = angular.module('fRepeat', []),
		fRepeatDirective = function fRepeatDirective(){
			return {
				restrict: 'A',
				transclude: 'element',
				priority: 1000,
				terminal: true,
				multiElement: true,
				compile: function(tElement, tAttrs) {
					var expression = tAttrs.fRepeat;
					var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);
					var lhs = match[1];
					var collectionIdentifier = match[2];

					match = lhs.match(/^(?:(\s*[\$\w]+)|\(\s*([\$\w]+)\s*,\s*([\$\w]+)\s*\))$/);
					var valueIdentifier = match[3] || match[1];

					return function LinkFn(scope, iElement, iAttrs, controller, transclude) {
						var parentElement = iElement[0].parentElement || iElement[0].parentNode,
							jQ = angular.element,
							lastBlockMap = {};
							
						scope.$watch(collectionIdentifier,function(collection){
							var content = [],
								nextBlockMap = {};

							function removeBlockFn(clone){
								return function(){
									jQ(clone).remove();
								};
							}
							
							for (var key in lastBlockMap){
								
								var blockToDestroy = lastBlockMap[key];
								window.requestAnimationFrame(removeBlockFn(blockToDestroy.clone));
								blockToDestroy.scope.$destroy();
							}

							for (var i = 0; i < collection.length; i++) {
								transclude(transcludeFuncFactory(collection[i], content, nextBlockMap, i));
							}
							lastBlockMap = nextBlockMap;
							//Unwrap JQLite element
							var elems = jQ.map(content,function(jqElm){
								return(jqElm.get());
							});
							window.requestAnimationFrame(function(){
								jQ(parentElement).append(elems);
							});
							
						});
					};

					function transcludeFuncFactory(val, content, nextBlockMap, key){
						return function(clone, scope){
							scope[valueIdentifier] = val;
							content[content.length++] = clone;
							nextBlockMap[key] = { scope: scope, clone: clone };
						};
					}
			}
		};
	};

	fRepeat.directive('fRepeat',fRepeatDirective);

})(angular, window);
