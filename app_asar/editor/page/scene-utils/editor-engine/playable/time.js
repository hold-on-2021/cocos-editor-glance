var lastUpdateTime = 0,
    startTime = 0,
    Time = {
        time: 0,
        realTime: 0,
        deltaTime: 0,
        frameCount: 0,
        maxDeltaTime: .3333333,
        _update: function (e, m, i) {
            if (!m) {
                i = i || Time.maxDeltaTime;
                var t = e - lastUpdateTime;
                t = Math.min(i, t), Time.deltaTime = t, lastUpdateTime = e, 0 === Time.frameCount ? startTime = e : (Time.time += t, Time.realTime = e - startTime), ++Time.frameCount
            }
        },
        _restart: function (e) {
            Time.time = 0, Time.realTime = 0, Time.deltaTime = 0, Time.frameCount = 0, lastUpdateTime = e
        }
    };
cc.Time = Time, module.exports = Time;