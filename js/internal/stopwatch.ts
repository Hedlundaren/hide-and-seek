class Stopwatch{

  private _time : number;
  private _startTime : number;
  private _done : boolean;

  constructor(time : number){
    this._time = time;
    this._startTime = time;
    this._done = false;
  }
  public done(){ return this._done;}
  public reset(){ this._time = this._startTime; this._done = false;}
  public update(deltaTime){
    if(this._time > 0)
      this._time -= deltaTime;
    else this._done = true;
  }

  public setStartTime(t){
    this._startTime = t;
  }
  public getStartTime(){ return this._startTime; }
}
