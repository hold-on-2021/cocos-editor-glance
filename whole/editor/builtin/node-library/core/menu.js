"use strict";exports.getPrefabMenuTemplate=function(e){return[{label:Editor.T("NODE_LIBRARY.delete"),enabled:e.modify,click(){Editor.Ipc.sendToPanel("node-library","node-library:delete-prefab",e)}},{label:Editor.T("NODE_LIBRARY.rename"),enabled:e.modify,click(){Editor.Ipc.sendToPanel("node-library","node-library:rename-prefab",e)}}]};