<script setup>
import IconHeart from '../components/icons/IconHeart.vue'
import IconSudokuHarbor from '../components/icons/IconSudokuHarbor.vue'

import Modal from '../components/Modal.vue'
</script>

<template>
  <div class="about">
    <h3>Made with <IconHeart class="heart"/> for my Mom</h3>

    <span>View the source code on <a href="https://github.com/konstfish/sudoku">GitHub</a></span>

    <div class="donate">
      Your donation helps sustain our website and awards you a Supporter Badge as a thank you.
      <a href='https://www.paypal.com/donate/?hosted_button_id=KVSN7JA556CLQ'>
        <button><IconHeart class="heart"/> Donate</button>
      </a>
    </div>

    <a @click="privacyModal = !privacyModal">Privacy Policy</a>

    <Modal v-show="privacyModal" height=380 width=320 @close="privacyModal = false">
      <div class="privacy-policy">
        <IconSudokuHarbor style="height: 200px;"/>
        <h3>Privacy Policy for SudokuHarbor.com</h3>
        <p>Effective Date: 28.10.2023</p>
        <p>Welcome to SudokuHarbor.com. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our website. Please read this policy carefully, and if you have any questions, feel free to contact us.</p>
        <h3>Information We Collect</h3>

        <p>Account Information: When you register on our website, we collect your email address, username, and a hashed version of your password.</p>
        <p>Replay Data: Users have the option to save a replay of their completed sudoku puzzles.</p>
        <p>Comments: Users can leave comments on puzzles they have completed.</p>
        <p>Third-party Advertising: We use Google AdSense to show ads to our users. Google may collect information to provide more relevant ads.</p>
        <h3>How We Use Your Information</h3>
        <p>Account Management: Your email, username, and hashed password are used to manage and secure your account on our platform.</p>

        <p>Enhance User Experience: Replay data and comments are used to enhance the user experience on our platform, allowing users to reflect on their gameplay and interact with other players.</p>

        <p>Advertising: We use Google AdSense to display ads. The data collected by Google aids in showing you relevant advertisements.</p>

        <h3>Storage of Information</h3>

        <p>LocalStorage: We use your browser's local storage to save game progress and authentication data. This information remains on your device and is not transferred to our servers or any third parties.</p>

        <p>Our Servers: We securely store your email, hashed password, and username on our servers.</p>

        <h3>Protection of Your Data</h3>

        <p>We prioritize the safety of your data. We employ security measures to protect your information from unauthorized access, alteration, disclosure, or destruction.</p>

        <p>While we take strong precautions, no online transmission method or electronic storage is 100% secure. As such, we cannot guarantee absolute security.</p>

        <h3>Third-party Services</h3>

        <p>Google AdSense: We use Google AdSense for advertising. For more information on how Google uses information from sites or apps that use their services, please visit Google's policy on advertising.</p>

        <p>Google Sign-in: If you choose to sign in with Google, please refer to Google's Privacy Policy to understand how they manage your data.</p>

        <h3>Children's Privacy</h3>

        <p>Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are under 13, please do not register on our site or provide any personal information.</p>

        <h3>Changes to This Privacy Policy</h3>

        <p>We may occasionally update this Privacy Policy. When we do, we will revise the "effective date" at the beginning of the Privacy Policy. We encourage users to frequently check this page for any changes.</p>
        <h3>Contact Us</h3>

        <p>If you have any questions about this Privacy Policy or our practices, please contact us at david@konst.fish.</p>
      </div>
    </Modal>
  </div>
</template>


<script>
  export default {
    data() {
      return {
        privacyModal: false
      }
    },
    methods: {
    },
  };
</script>

<style scoped>
.heart {
  color: var(--color-accent-sec);
}

.privacy-policy{
  overflow-y: scroll;
  height: 320px;
  width: 300px;
}

.about{
  display: flex;
  flex-direction: column;

  gap: 12px;
}

.donate{
  display: flex;
  flex-direction: column;
  gap: 6px;
}

button{
  cursor: pointer;
}

a{
  cursor: pointer;
}
</style>
