<template>
  <div id="vjs-loading-icon">
    <svg class="vjs-loading-icon__icon" width="50px" height="50px" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" gradientUnits="objectBoundingBox" gradientTransform="rotate(135 0.5 0.5)">
          <stop offset="0%" stop-color="#3cdbff"></stop>
          <stop offset="100%" stop-color="#2794ff"></stop>
        </linearGradient>
      </defs>
      <circle class="vjs-loading-icon__icon-path" stroke="url(#grad)" stroke-width="10" fill="none" stroke-linecap="round" cx="40" cy="40" r="30"></circle>
    </svg>
    <div style="margin-top: 8px;">加载中...</div>
  </div>
</template>

<script>
export default {
  name: 'loading-icon'
}
</script>

<style>
  #vjs-loading-icon {
    display: none;
    position: absolute;
    left: 50%;
    top: 50%;
    width: 100px;
    height: 100px;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  @keyframes showLoadingIcon {
    0% {
      opacity: 0;
    }
    90% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  .vjs-waiting #vjs-loading-icon {
    /* loading需要在wating之后一秒钟展示 */
    display: block;
    animation: showLoadingIcon 1.1s linear;
  }

  @keyframes rotator {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(270deg);
    }
  }

  .vjs-loading-icon__icon {
    animation: rotator 1.4s linear infinite;
  }

  @keyframes dash {
    0% {
      stroke-dashoffset: 188.8;
      opacity: 0;
    }
    50% {
      stroke-dashoffset: 47.2;
      transform: rotate(135deg);
      opacity: 1;
    }
    100% {
      stroke-dashoffset: 188.8;
      transform: rotate(450deg);
      opacity: 0;
    }
  }

  .vjs-loading-icon__icon-path {
    stroke-dasharray: 188.8;
    stroke-dashoffset: 0;
    transform-origin: center;
    animation: dash 1.4s ease-in-out infinite;
  }
</style>
