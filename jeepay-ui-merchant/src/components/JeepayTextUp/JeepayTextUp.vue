<template>
  <div class="jee-text-up" >
    <a-input required="required" :value="msg" @input="$emit('input', $event.target.value)">
    </a-input>
    <label>{{ placeholder }}</label>
  </div>
</template>

<script>
export default {
  name: 'JeepayTextUp',
  // props: ['msg', 'placeholder']
  props: {
    msg: { type: String },
    placeholder: { type: String }
  }
}
</script>

<style scoped lang="less">
// 文字上移 效果
.jee-text-up {
  flex-grow:1;
  flex-shrink: 1;
  position: relative;
  min-width: 180px;
  max-width: 230px;
  margin-bottom:30px;
  margin-right: 16px;

  input {

    outline: 0;
    text-indent: 60px;
    transition: all .3s ease-in-out;
  }
  input::-webkit-input-placeholder {
    color: #BFBFBF;
    text-indent: 0;
  }
  input + label {
    pointer-events: none;
    position: absolute;
    left: 0;
    bottom: 6px;
    padding: 2px 11px;
    color: #BFBFBF;
    font-size: 13px;
    text-transform: uppercase;
    transition: all .3s ease-in-out;
    border-radius: 3px;
    background: rgba(122, 184, 147, 0);
    height: 20px;
    line-height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  // 三角形
  input + label:after {
    position: absolute;
    content: "";
    width: 0;
    height: 0;
    top: 100%;
    left: 50%;
    margin-left: -3px;
    border-left: 3px solid transparent;
    border-right: 3px solid transparent;
    transition: all .3s ease-in-out;
  }
  input:focus,
  input:active,
  input:valid + label {
    text-indent: 0;
    background: #fff;
  }
  input:focus + label,
  input:active + label,
  input:valid + label {
    color: #fff;
    background: @jee-theme;
    transform: translateY(-33px);
  }
  input:focus + label:after,
  input:active + label:after {
    border-top: 4px solid @jee-theme;
  }

  input:valid {
    text-indent: 0; //文字不下移
  }
  input:valid + label{
    background: #dadada; // 更换背景色
  }

  input:valid + label:after{ // 更换背景色
    border-top: 4px solid #dadada;
  }
}

// 初版文字上移 效果
// .jee-text-up {
//   position: relative;

//   .jee-text-label {
//     position: absolute;
//     z-index: 1;
//     left: 15px;
//     top: 0px;
//     transition: all .3s;
//     color: #bfbfbf;
//     pointer-events: none;
//     height: 20px;
//     line-height: 20px;
//   }

//   input:focus + .jee-text-label, input:valid + .jee-text-label {
//     top: -35px;
//     padding: 1px 10px;
//     border-radius: 5px;
//     background: @jee-theme;
//     color: #fff;
//   }
// }
</style>
