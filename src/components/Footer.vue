<script setup lang="ts"></script>

<template>
  <footer class="site-footer">
    <div class="footer-content">
      <img class="logo-placeholder" src="../assets/ufpi-seeklogo.png" alt="UFPI logo" />
      <p class="address">
        <strong>Endereço:</strong> © 2025, Bairro Ininga – Teresina – PI • CEP: 64049‑550<br />
        Universidade Federal do Piauí – UFPI • Campus Universitário Ministro Petrônio Portella
      </p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  /* background: var(--color-primary-container, #4f768b); */
  color: var(--color-on-primary-container, #ffffff);
  padding: 2rem 1rem;
  font-size: 0.9rem;
}

.footer-content {
  max-width: 1024px;
  margin-inline: auto;
  display: flex;
  align-items: center;
  gap: 2rem;
  text-align: center;
  flex-wrap: wrap;
  justify-content: center;
}

.logo-placeholder {
  width: calc(64px * 1.5);
  height: calc(90px * 1.5);
  padding: 0.5rem;
  /* background: var(--color-on-primary-container, #ffffff); */
  color: var(--color-primary-container, #4f768b);
  display: grid;
  place-content: center;
  font-weight: 700;
  border-radius: 4px;
}

.address {
  line-height: 1.4;
  font-weight: 500;
}
</style>
