var MarchingSquares={};MarchingSquares.NONE=0,MarchingSquares.UP=1,MarchingSquares.LEFT=2,MarchingSquares.DOWN=3,MarchingSquares.RIGHT=4,MarchingSquares.getBlobOutlinePoints=function(a,r,e,n){MarchingSquares.data=a,MarchingSquares.width=r,MarchingSquares.height=e,MarchingSquares.loop=n;var s=MarchingSquares.getFirstNonTransparentPixelTopDown(),i=MarchingSquares.walkPerimeter(s.x,s.y);return MarchingSquares.width=null,MarchingSquares.height=null,MarchingSquares.data=null,MarchingSquares.loop=null,i},MarchingSquares.getFirstNonTransparentPixelTopDown=function(){var a,r,e=MarchingSquares.data,n=MarchingSquares.width,s=MarchingSquares.height,i=0;for(a=0;a<s;a++)for(r=0;r<n;r++,i+=4)if(e[i+3]>0)return{x:r,y:a};return null},MarchingSquares.walkPerimeter=function(a,r){a<0&&(a=0),a>MarchingSquares.width&&(a=MarchingSquares.width),r<0&&(r=0),r>MarchingSquares.height&&(r=MarchingSquares.height);var e=a,n=r,s=[cc.v2(e,n)];do{switch(MarchingSquares.step(e,n,MarchingSquares.data),MarchingSquares.nextStep){case MarchingSquares.UP:n--;break;case MarchingSquares.LEFT:e--;break;case MarchingSquares.DOWN:n++;break;case MarchingSquares.RIGHT:e++}e>=0&&e<=MarchingSquares.width&&n>=0&&n<=MarchingSquares.height&&s.push(cc.v2(e,n))}while(e!==a||n!==r);return MarchingSquares.loop&&s.push(cc.v2(e,n)),s},MarchingSquares.step=function(a,r,e){var n=MarchingSquares.width,s=4*n,i=(r-1)*s+4*(a-1),c=a>0,h=a<n,u=r<MarchingSquares.height,S=r>0;switch(MarchingSquares.upLeft=S&&c&&e[i+3]>0,MarchingSquares.upRight=S&&h&&e[i+7]>0,MarchingSquares.downLeft=u&&c&&e[i+s+3]>0,MarchingSquares.downRight=u&&h&&e[i+s+7]>0,MarchingSquares.previousStep=MarchingSquares.nextStep,MarchingSquares.state=0,MarchingSquares.upLeft&&(MarchingSquares.state|=1),MarchingSquares.upRight&&(MarchingSquares.state|=2),MarchingSquares.downLeft&&(MarchingSquares.state|=4),MarchingSquares.downRight&&(MarchingSquares.state|=8),MarchingSquares.state){case 1:MarchingSquares.nextStep=MarchingSquares.UP;break;case 2:case 3:MarchingSquares.nextStep=MarchingSquares.RIGHT;break;case 4:MarchingSquares.nextStep=MarchingSquares.LEFT;break;case 5:MarchingSquares.nextStep=MarchingSquares.UP;break;case 6:MarchingSquares.previousStep==MarchingSquares.UP?MarchingSquares.nextStep=MarchingSquares.LEFT:MarchingSquares.nextStep=MarchingSquares.RIGHT;break;case 7:MarchingSquares.nextStep=MarchingSquares.RIGHT;break;case 8:MarchingSquares.nextStep=MarchingSquares.DOWN;break;case 9:MarchingSquares.previousStep==MarchingSquares.RIGHT?MarchingSquares.nextStep=MarchingSquares.UP:MarchingSquares.nextStep=MarchingSquares.DOWN;break;case 10:case 11:MarchingSquares.nextStep=MarchingSquares.DOWN;break;case 12:MarchingSquares.nextStep=MarchingSquares.LEFT;break;case 13:MarchingSquares.nextStep=MarchingSquares.UP;break;case 14:MarchingSquares.nextStep=MarchingSquares.LEFT;break;default:MarchingSquares.nextStep=MarchingSquares.NONE}},module.exports=MarchingSquares;