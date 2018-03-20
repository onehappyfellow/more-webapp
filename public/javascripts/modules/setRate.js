import axios from 'axios';

function ajaxSetRate(e){
  e.preventDefault();
  const [min, max] = [1, 3];
  let newRate = (this.change.value == 'up') ? this.currentRate.value + 0.2 : this.currentRate.value - 0.2;
  if (newRate < min) newRate = min;
  if (newRate > max) newRate = max;

  // initiate post
  axios.post(this.action).then(res => {
    console.log(res);
  }).catch(console.error);
}

export default ajaxSetRate;
