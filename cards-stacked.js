/**
 * Cards Stacked GSAP Animation
 * Handles scroll-triggered card stacking with configurable settings.
 */
(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  // ---------- defaults ----------
  const defaults = {
    layout: 'row',
    stackDirection: 'vertical',
    triggerPoint: 'center center',
    customTrigger: 'top top+=100',
    delay: 0,
    easing: 'power3.out',
    rotation: 80,
    transformOrigin: 'bottom center',
    stackOffset: 20,
  };

  let currentSettings = { ...defaults };
  let scrollTriggerInstance = null;
  let timelineInstance = null;

  // ---------- helpers ----------
  function getTrigger() {
    if (currentSettings.triggerPoint === 'custom') {
      return currentSettings.customTrigger || defaults.customTrigger;
    }
    return currentSettings.triggerPoint;
  }

  function killAll() {
    if (timelineInstance) {
      timelineInstance.kill();
      timelineInstance = null;
    }
    if (scrollTriggerInstance) {
      scrollTriggerInstance.kill();
      scrollTriggerInstance = null;
    }
    ScrollTrigger.getAll().forEach(function (st) {
      st.kill();
    });
  }

  function resetCards(cards) {
    gsap.set(cards, {
      clearProps: 'transform',
      top: 0,
      left: 0,
      y: 0,
      x: 0,
      yPercent: 0,
      xPercent: 0,
      scale: 1,
      opacity: 1,
      borderRadius: '20px',
      boxShadow: '0 10px 50px rgba(0, 0, 0, 0.5)',
      rotation: 0,
      rotationX: 0,
      rotationY: 0,
      z: 0,
      transformOrigin: 'center center',
    });
  }

  // ---------- animation builders ----------

  /**
   * Vertical stack animation
   */
  function buildVertical(wrapper, cards) {
    const trigger = getTrigger();
    const delay = parseFloat(currentSettings.delay) || 0;
    const rotation = currentSettings.rotation != null ? parseFloat(currentSettings.rotation) : defaults.rotation;
    const transformOrigin = currentSettings.transformOrigin || defaults.transformOrigin;
    const totalCards = cards.length;
    const useRotation = rotation !== 0;

    gsap.set(cards, {
      transformPerspective: 1000,
      transformStyle: 'preserve-3d',
      backfaceVisibility: 'hidden',
    });

    // Set initial state: card 0 visible, rest at yPercent 100
    cards.forEach(function (item, i) {
      if (i !== 0) {
        gsap.set(item, {
          yPercent: 100,
          opacity: 0,
          transformOrigin: transformOrigin,
        });
        if (useRotation) {
          gsap.set(item, { rotationX: rotation });
        }
      }
    });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        pin: true,
        start: trigger,
        end: '+=' + totalCards * 100 + '%',
        scrub: 1 + delay,
        invalidateOnRefresh: true,
      },
      defaults: { ease: 'none' },
    });

    cards.forEach(function (item, index) {
      // Scale down current card
      timeline.to(
        item,
        {
          scale: 0.9,
          borderRadius: '10px',
        }
      );

      // Bring next card in
      if (index < totalCards - 1) {
        const nextProps = {
          yPercent: 0,
          opacity: 1,
        };
        if (useRotation) {
          nextProps.rotationX = 0;
        }
        timeline.to(
          cards[index + 1],
          nextProps,
          '<'
        );
      }
    });

    timelineInstance = timeline;
    scrollTriggerInstance = timeline.scrollTrigger;
  }

  /**
   * Horizontal stack animation
   */
  function buildHorizontal(wrapper, cards) {
    const trigger = getTrigger();
    const delay = parseFloat(currentSettings.delay) || 0;
    const rotation = currentSettings.rotation != null ? parseFloat(currentSettings.rotation) : defaults.rotation;
    const transformOrigin = currentSettings.transformOrigin || defaults.transformOrigin;
    const totalCards = cards.length;
    const useRotation = rotation !== 0;

    gsap.set(cards, {
      transformPerspective: 1000,
      transformStyle: 'preserve-3d',
      backfaceVisibility: 'hidden',
    });

    // Set initial state: card 0 visible, rest at xPercent 100
    cards.forEach(function (item, i) {
      if (i !== 0) {
        gsap.set(item, {
          xPercent: 100,
          opacity: 0,
          transformOrigin: transformOrigin,
        });
        if (useRotation) {
          gsap.set(item, { rotationY: rotation });
        }
      }
    });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        pin: true,
        start: trigger,
        end: '+=' + totalCards * 100 + '%',
        scrub: 1 + delay,
        invalidateOnRefresh: true,
      },
      defaults: { ease: 'none' },
    });

    cards.forEach(function (item, index) {
      // Scale down current card
      timeline.to(
        item,
        {
          scale: 0.9,
          borderRadius: '10px',
        }
      );

      // Bring next card in
      if (index < totalCards - 1) {
        const nextProps = {
          xPercent: 0,
          opacity: 1,
        };
        if (useRotation) {
          nextProps.rotationY = 0;
        }
        timeline.to(
          cards[index + 1],
          nextProps,
          '<'
        );
      }
    });

    timelineInstance = timeline;
    scrollTriggerInstance = timeline.scrollTrigger;
  }

  // ---------- main init / rebuild ----------

  function rebuild(newSettings) {
    if (newSettings) {
      currentSettings = { ...currentSettings, ...newSettings };
    }

    var wrapper = document.getElementById('haCardStackedWrapper');
    if (!wrapper) return;

    var container = wrapper.querySelector('.stacked-cards-container');
    var cards = Array.prototype.slice.call(
      wrapper.querySelectorAll('.stacked-card')
    );
    if (!container || cards.length === 0) return;

    // kill old animation
    killAll();

    // reset card styles
    resetCards(cards);

    // apply data attributes
    wrapper.setAttribute('data-layout', currentSettings.layout);
    wrapper.setAttribute('data-stack', currentSettings.stackDirection);
    wrapper.setAttribute('data-rotation', currentSettings.rotation);
    wrapper.setAttribute('data-transform-origin', currentSettings.transformOrigin || '');
    wrapper.setAttribute('data-stack-offset', currentSettings.stackOffset);

    // build animation based on stack direction only (not layout)
    if (currentSettings.stackDirection === 'horizontal') {
      buildHorizontal(wrapper, cards);
    } else {
      buildVertical(wrapper, cards);
    }

    ScrollTrigger.refresh();
  }

  // ---------- settings panel ----------

  function setupPanel() {
    var panel = document.getElementById('settingsPanel');
    var toggle = document.getElementById('settingsToggle');
    var layoutSelect = document.getElementById('layoutSelect');
    var stackDir = document.getElementById('stackDirection');
    var triggerSel = document.getElementById('triggerSelect');
    var customGroup = document.getElementById('customTriggerGroup');
    var customInput = document.getElementById('customTrigger');
    var delayInput = document.getElementById('delayInput');
    var easingSel = document.getElementById('easingSelect');
    var stackOffsetInput = document.getElementById('stackOffsetInput');
    var rotationInput = document.getElementById('rotationInput');
    var transformOriginInput = document.getElementById('transformOriginInput');
    var applyBtn = document.getElementById('applyBtn');

    if (!panel || !toggle) return;

    // toggle open / close
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });

    // custom trigger visibility
    triggerSel.addEventListener('change', function () {
      customGroup.style.display =
        triggerSel.value === 'custom' ? 'block' : 'none';
    });

    // apply button
    applyBtn.addEventListener('click', function () {
      rebuild({
        layout: layoutSelect.value,
        stackDirection: stackDir.value,
        triggerPoint: triggerSel.value,
        customTrigger: customInput.value || 'top top+=100',
        delay: parseFloat(delayInput.value) || 0,
        easing: easingSel.value,
        stackOffset: parseFloat(stackOffsetInput.value) || 0,
        rotation: parseFloat(rotationInput.value),
        transformOrigin: transformOriginInput.value || null,
      });

      applyBtn.textContent = 'Applied!';
      applyBtn.style.background =
        'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
      setTimeout(function () {
        applyBtn.textContent = 'Apply & Rebuild';
        applyBtn.style.background = '';
      }, 1200);
    });

    // populate defaults into UI
    layoutSelect.value = currentSettings.layout;
    stackDir.value = currentSettings.stackDirection;
    triggerSel.value = currentSettings.triggerPoint;
    customInput.value = currentSettings.customTrigger;
    delayInput.value = currentSettings.delay;
    easingSel.value = currentSettings.easing;
    stackOffsetInput.value = currentSettings.stackOffset;
    rotationInput.value = currentSettings.rotation;
    transformOriginInput.value = currentSettings.transformOrigin || '';
    if (currentSettings.triggerPoint === 'custom') {
      customGroup.style.display = 'block';
    }
  }

  // ---------- boot ----------

  function init() {
    setupPanel();
    rebuild();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
