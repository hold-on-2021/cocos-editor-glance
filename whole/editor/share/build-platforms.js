var CommonNative=()=>({isNative:!0,pack:!0,useTemplate:!0,stripDefaultValues:!0,exportSimpleProject:!1}),CommonWeb=()=>({isNative:!1,pack:!0,useTemplate:!1,stripDefaultValues:!0,exportSimpleProject:!1});module.exports={android:CommonNative(),ios:CommonNative(),mac:CommonNative(),win32:CommonNative(),"web-mobile":CommonWeb(),"web-desktop":CommonWeb(),"fb-instant-games":CommonWeb(),wechatgame:CommonWeb(),qqplay:CommonWeb(),export:{isNative:!0,pack:!1,useTemplate:!1,stripDefaultValues:!1,exportSimpleProject:!0},editor:{isNative:!1}};