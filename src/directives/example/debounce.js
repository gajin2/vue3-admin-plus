/**
 * v-debounce
 * 按钮防抖指令，可自行扩展至input
 * 接收参数：function类型
 */
export default {
    mounted(el, binding) {
        if (typeof binding.value !== 'function') {
            console.error('callback must be a function');
            return;
        }
        let timer = null;
        el.__handleClick__ = function () {
            if (timer) {
                clearInterval(timer);
            }
            timer = setTimeout(() => {
                binding.value();
            }, 200);
        };
        el.addEventListener('click', el.__handleClick__);
    },
    beforeUnmount(el) {
        el.removeEventListener('click', el.__handleClick__);
    }
};
