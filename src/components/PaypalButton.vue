<template>
  <div id="donate-button-container">
    <div id="donate-button"><button><IconHeart class="heart"/> Donate</button></div>
  </div>
</template>

<script>
export default {
  name: 'PaypalDonateButton',

  mounted() {
    this.loadPaypalScript();
  },

  methods: {
    loadPaypalScript() {
      const script = document.createElement('script');
      script.src = "https://www.paypalobjects.com/donate/sdk/donate-sdk.js";
      script.charset = "UTF-8";
      script.onload = this.initializePaypalButton;
      document.body.appendChild(script);
    },

    initializePaypalButton() {
      if (window.PayPal && window.PayPal.Donation && window.PayPal.Donation.Button) {
        PayPal.Donation.Button({
          env: 'production',
          hosted_button_id: 'KVSN7JA556CLQ',
          image: {
            src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
            alt: 'Donate with PayPal button',
            title: 'PayPal - The safer, easier way to pay online!',
          }
        }).render('#donate-button');
      }
    }
  }
};
</script>

<style scoped>

</style>