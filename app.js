/**
 * CertiCraft Studio - Application Logic & State Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // --- State Object ---
  const state = {
    zoom: 1,
    orientation: 'landscape',
    theme: 'royal-gold',
    titleFont: "'Cinzel', serif",
    recipientFont: "'Playfair Display', serif",
    colors: {
      accent: '#d4af37',
      border: '#112233',
      bg: '#ffffff'
    },
    signer1: {
      mode: 'font', // 'font' | 'draw' | 'upload'
      name: 'Dr. Evelyn Vance',
      title: 'Dean of Academic Council',
      imageData: null
    },
    signer2: {
      mode: 'font',
      name: 'Marcus Sterling',
      title: 'Director of Certification & Standards',
      imageData: null
    },
    logo: null,
    activeBrand: 'dual',
    logoMode: 'vector-badge',
    logoColor: 'original',
    seal: 'gold-crest',
    showQr: true,
    showFlourishes: true,
    editMode: true
  };

  // --- DOM References ---
  const certificateNode = document.getElementById('certificateNode');
  const certificateWrapper = document.getElementById('certificateWrapper');
  const certificateViewport = document.getElementById('certificateViewport');
  const zoomLevelSpan = document.getElementById('zoomLevel');

  // Input Fields & Corresponding Certificate Elements
  const fieldBindings = [
    { inputId: 'inputOrgName', certId: 'certOrg' },
    { inputId: 'inputCertTitle', certId: 'certTitle' },
    { inputId: 'inputPresentation', certId: 'certPresentation' },
    { inputId: 'inputRecipient', certId: 'certRecipient' },
    { inputId: 'inputCourse', certId: 'certCourse' },
    { inputId: 'inputDescription', certId: 'certDescription' },
    { inputId: 'inputDate', certId: 'certDateSpan' },
    { inputId: 'inputCertId', certId: 'certIdSpan' },
    { inputId: 'inputSigner1Name', certId: 'certSigner1Name' },
    { inputId: 'inputSigner1Title', certId: 'certSigner1Title' },
    { inputId: 'inputSigner2Name', certId: 'certSigner2Name' },
    { inputId: 'inputSigner2Title', certId: 'certSigner2Title' }
  ];

  // Presets definition
  const presets = {
    completion: {
      title: 'CERTIFICATE OF COMPLETION',
      presentation: 'THIS IS PROUDLY CONFERRED UPON',
      recipient: 'Alexander Montgomery',
      course: 'Advanced Full-Stack Engineering & System Architecture',
      description: 'for successfully completing all curriculum requirements, practical examinations, and hands-on laboratory modules with highest distinction.',
      theme: 'royal-gold'
    },
    appreciation: {
      title: 'CERTIFICATE OF APPRECIATION',
      presentation: 'EXPRESSED WITH SINCERE GRATITUDE TO',
      recipient: 'Victoria Kensington',
      course: 'Outstanding Leadership & Community Mentorship',
      description: 'in sincere recognition of selfless dedication, inspirational guidance, and significant contributions to our global community programs.',
      theme: 'emerald-bronze'
    },
    achievement: {
      title: 'CERTIFICATE OF EXCELLENCE',
      presentation: 'AWARDED WITH HIGHEST HONORS TO',
      recipient: 'Julian Ross Sterling',
      course: 'Annual Innovation Challenge & Hackathon 2026',
      description: 'for demonstrating unmatched ingenuity, technical mastery, and exceptional execution in architecting the first-place winning platform.',
      theme: 'crimson-luxury'
    },
    attendance: {
      title: 'CERTIFICATE OF PARTICIPATION',
      presentation: 'VERIFYING THE ACTIVE ATTENDANCE OF',
      recipient: 'Elena Rostova',
      course: 'Global AI & Cloud Infrastructure Symposium',
      description: 'for engaged participation, collaborative discussions, and continuous commitment to ongoing technical development and education.',
      theme: 'geometric-tech'
    },
    honor: {
      title: 'DIPLOMA OF HIGH HONOR',
      presentation: 'BE IT KNOWN BY ALL PRESENT THAT',
      recipient: 'Jonathan Drake Caldwell',
      course: 'Mastery of Computer Science & Cryptographic Systems',
      description: 'having satisfied all academic rigors and demonstrated exemplary scholastic discipline and character as attested by the Faculty Senate.',
      theme: 'vintage-parchment'
    },
    blank: {
      title: 'TITLE OF CERTIFICATE',
      presentation: 'PRESENTED TO',
      recipient: 'Recipient Full Name',
      course: 'Special Accomplishment / Designation',
      description: 'Type here to add your own custom description and recognition details directly on the certificate.',
      theme: 'monochrome-slate'
    }
  };

  // --- Initialize 2-Way Data Binding ---
  function initDataBinding() {
    fieldBindings.forEach(({ inputId, certId }) => {
      const inputEl = document.getElementById(inputId);
      const certEl = document.getElementById(certId);

      if (!inputEl || !certEl) return;

      // Sidebar input -> Certificate text
      inputEl.addEventListener('input', () => {
        certEl.textContent = inputEl.value;
        if (inputId === 'inputSigner1Name' && state.signer1.mode === 'font') {
          document.getElementById('fontSign1').textContent = inputEl.value;
        }
        if (inputId === 'inputSigner2Name' && state.signer2.mode === 'font') {
          document.getElementById('fontSign2').textContent = inputEl.value;
        }
      });

      // Certificate direct click/edit -> Sidebar input
      certEl.addEventListener('input', () => {
        inputEl.value = certEl.textContent.trim();
        if (certId === 'certSigner1Name' && state.signer1.mode === 'font') {
          document.getElementById('fontSign1').textContent = certEl.textContent.trim();
        }
        if (certId === 'certSigner2Name' && state.signer2.mode === 'font') {
          document.getElementById('fontSign2').textContent = certEl.textContent.trim();
        }
      });

      // Clean paste into contenteditable to avoid rogue formatting
      certEl.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.originalEvent || e).clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
      });
    });

    // Special: Signer 1 & 2 calligraphy sync
    const inputSigner1 = document.getElementById('inputSigner1Name');
    if (inputSigner1) {
      inputSigner1.addEventListener('input', (e) => {
        if (state.signer1.mode === 'font') {
          document.getElementById('fontSign1').textContent = e.target.value;
        }
      });
    }

    const inputSigner2 = document.getElementById('inputSigner2Name');
    if (inputSigner2) {
      inputSigner2.addEventListener('input', (e) => {
        if (state.signer2.mode === 'font') {
          document.getElementById('fontSign2').textContent = e.target.value;
        }
      });
    }

    // Seal outer text
    const sealTextInput = document.getElementById('sealText');
    const svgSealText = document.getElementById('svgSealText');
    if (sealTextInput && svgSealText) {
      sealTextInput.addEventListener('input', () => {
        svgSealText.textContent = sealTextInput.value.trim() || 'OFFICIAL EXCELLENCE AWARD •';
      });
    }
  }

  // --- Sidebar Tabs ---
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(targetTab)?.classList.add('active');
    });
  });

  // --- Preset Switcher ---
  const presetSelect = document.getElementById('presetSelect');
  presetSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    const data = presets[val];
    if (!data) return;

    document.getElementById('inputCertTitle').value = data.title;
    document.getElementById('certTitle').textContent = data.title;

    document.getElementById('inputPresentation').value = data.presentation;
    document.getElementById('certPresentation').textContent = data.presentation;

    document.getElementById('inputRecipient').value = data.recipient;
    document.getElementById('certRecipient').textContent = data.recipient;

    document.getElementById('inputCourse').value = data.course;
    document.getElementById('certCourse').textContent = data.course;

    document.getElementById('inputDescription').value = data.description;
    document.getElementById('certDescription').textContent = data.description;

    // Apply associated theme
    setTheme(data.theme);
    showToast(`Loaded "${presetSelect.options[presetSelect.selectedIndex].text}" preset!`);
  });

  // --- Theme Selection ---
  function setTheme(themeStyle) {
    state.theme = themeStyle;
    // Clear old theme classes
    certificateNode.className = certificateNode.className
      .replace(/theme-style-[\w-]+/g, '')
      .trim();
    certificateNode.classList.add(`theme-style-${themeStyle}`);

    // Update active card in sidebar
    document.querySelectorAll('.theme-card').forEach(card => {
      if (card.getAttribute('data-style') === themeStyle) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  document.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', () => {
      const style = card.getAttribute('data-style');
      setTheme(style);
    });
  });

  // --- Custom Colors ---
  const customAccentColor = document.getElementById('customAccentColor');
  const customBorderColor = document.getElementById('customBorderColor');
  const customBgColor = document.getElementById('customBgColor');

  customAccentColor.addEventListener('input', (e) => {
    const color = e.target.value;
    certificateNode.style.setProperty('--cert-gold-1', color);
    certificateNode.style.setProperty('--cert-gold-2', color);
  });

  customBorderColor.addEventListener('input', (e) => {
    const color = e.target.value;
    certificateNode.querySelector('.cert-outer-border').style.borderColor = color;
  });

  customBgColor.addEventListener('input', (e) => {
    const color = e.target.value;
    certificateNode.style.backgroundColor = color;
    certificateNode.querySelector('.cert-outer-border').style.backgroundColor = color;
  });

  // --- Font Selection ---
  const fontSelect = document.getElementById('fontSelect');
  fontSelect.addEventListener('change', (e) => {
    state.titleFont = e.target.value;
    document.getElementById('certTitle').style.fontFamily = state.titleFont;
  });

  const recipientFontSelect = document.getElementById('recipientFontSelect');
  recipientFontSelect.addEventListener('change', (e) => {
    state.recipientFont = e.target.value;
    document.getElementById('certRecipient').style.fontFamily = state.recipientFont;
  });

  // --- Orientation Toggle ---
  document.querySelectorAll('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const orientation = btn.getAttribute('data-orientation');
      state.orientation = orientation;

      if (orientation === 'portrait') {
        certificateNode.classList.remove('landscape');
        certificateNode.classList.add('portrait');
      } else {
        certificateNode.classList.remove('portrait');
        certificateNode.classList.add('landscape');
      }
      autoFitZoom();
    });
  });

  // --- Seals & Emblems Selection ---
  document.querySelectorAll('.seal-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.seal-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      const sealType = opt.getAttribute('data-seal');
      state.seal = sealType;

      const sealBlock = document.getElementById('certSealContainer');
      if (sealType === 'none') {
        sealBlock.classList.add('hidden');
      } else {
        sealBlock.classList.remove('hidden');
      }
    });
  });

  // --- Toggle QR & Flourishes ---
  const toggleQr = document.getElementById('toggleQr');
  const certQrBox = document.getElementById('certQrBox');
  const qrUrlWrapper = document.getElementById('qrUrlWrapper');

  toggleQr.addEventListener('change', (e) => {
    state.showQr = e.target.checked;
    if (state.showQr) {
      certQrBox.classList.remove('hidden');
      qrUrlWrapper.classList.remove('hidden');
    } else {
      certQrBox.classList.add('hidden');
      qrUrlWrapper.classList.add('hidden');
    }
  });

  const toggleFlourishes = document.getElementById('toggleFlourishes');
  toggleFlourishes.addEventListener('change', (e) => {
    state.showFlourishes = e.target.checked;
    const corners = document.querySelectorAll('.ornament-corner');
    corners.forEach(c => {
      c.style.display = state.showFlourishes ? 'block' : 'none';
    });
  });

  // --- Verification QR Code Generator ---
  let qrcodeInstance = null;
  function updateQrCode(url) {
    const qrContainer = document.getElementById('qrcode');
    if (!qrContainer) return;
    qrContainer.innerHTML = '';
    try {
      if (typeof QRCode !== 'undefined') {
        qrcodeInstance = new QRCode(qrContainer, {
          text: url || 'https://verify.certicraft.org',
          width: 48,
          height: 48,
          colorDark: '#0f172a',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    } catch (err) {
      console.warn('QR Code generation fallback:', err);
    }
  }

  const qrVerifyUrlInput = document.getElementById('qrVerifyUrl');
  qrVerifyUrlInput.addEventListener('input', (e) => {
    updateQrCode(e.target.value.trim());
  });
  updateQrCode(qrVerifyUrlInput.value);

  // --- Certificate ID Generator ---
  const generateIdBtn = document.getElementById('generateIdBtn');
  generateIdBtn.addEventListener('click', () => {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newId = `CERT-${new Date().getFullYear()}-${randomHex}`;
    document.getElementById('inputCertId').value = newId;
    document.getElementById('certIdSpan').textContent = newId;
    qrVerifyUrlInput.value = `https://verify.certicraft.org/cert/${newId}`;
    updateQrCode(qrVerifyUrlInput.value);
    showToast(`Generated unique ID: ${newId}`);
  });

  // --- Direct Edit Mode Toggle ---
  const toggleEditModeBtn = document.getElementById('toggleEditModeBtn');
  document.body.classList.add('edit-mode-active');
  toggleEditModeBtn.classList.add('active');

  toggleEditModeBtn.addEventListener('click', () => {
    state.editMode = !state.editMode;
    if (state.editMode) {
      document.body.classList.add('edit-mode-active');
      toggleEditModeBtn.classList.add('active');
      document.getElementById('editHintBanner').style.display = 'flex';
      showToast('Direct edit mode ENABLED. Click any text on the certificate.');
    } else {
      document.body.classList.remove('edit-mode-active');
      toggleEditModeBtn.classList.remove('active');
      document.getElementById('editHintBanner').style.display = 'none';
      showToast('Direct edit mode DISABLED.');
    }
  });

  // --- Organization Branding & Dual Logo Engine (KauraHub & EETIRP) ---
  const certKhLogoWrapper = document.getElementById('certKhLogoWrapper');
  const certKhSvg = document.getElementById('certKhSvg');
  const certKhOriginalImg = document.getElementById('certKhOriginalImg');
  const certEetirpLogoWrapper = document.getElementById('certEetirpLogoWrapper');
  const certEetirpSvg = document.getElementById('certEetirpSvg');
  const certEetirpOriginalImg = document.getElementById('certEetirpOriginalImg');
  const certLogoDivider = document.getElementById('certLogoDivider');
  const brandSelectBtns = document.querySelectorAll('.brand-select-btn');
  const logoModeBtns = document.querySelectorAll('.logo-mode-btn');
  const logoColorChips = document.querySelectorAll('.logo-color-chip');
  const customLogoColorInput = document.getElementById('customLogoPrimaryColor');
  const customLogoColorHex = document.getElementById('customLogoColorHex');
  const logoSizeSlider = document.getElementById('logoSizeSlider');
  const logoSizeVal = document.getElementById('logoSizeVal');
  const resetKauraLogoBtn = document.getElementById('resetKauraLogoBtn');
  const logoUploadInput = document.getElementById('logoUploadInput');
  const certCustomLogo = document.getElementById('certCustomLogo');

  // Helper function to darken/brighten hex color for gradients
  function adjustBrightness(hex, percent) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
  }

  // Brand Switcher (KauraHub, EETIRP, Dual)
  function setBrand(brand, silent = false) {
    state.activeBrand = brand;
    brandSelectBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-brand') === brand);
    });

    const certOrg = document.getElementById('certOrg');
    const inputOrg = document.getElementById('inputOrgName');

    if (certCustomLogo) certCustomLogo.classList.add('hidden');

    if (brand === 'kaurahub') {
      certKhLogoWrapper?.classList.remove('hidden');
      certEetirpLogoWrapper?.classList.add('hidden');
      certLogoDivider?.classList.add('hidden');
      if (certOrg && inputOrg) {
        certOrg.textContent = 'KAURAHUB';
        inputOrg.value = 'KAURAHUB';
      }
      if (!silent) showToast('KauraHub logo set as primary brand.');
    } else if (brand === 'eetirp') {
      certKhLogoWrapper?.classList.add('hidden');
      certEetirpLogoWrapper?.classList.remove('hidden');
      certLogoDivider?.classList.add('hidden');
      if (certOrg && inputOrg) {
        certOrg.textContent = 'EETIRP';
        inputOrg.value = 'EETIRP';
      }
      if (!silent) showToast('EETIRP logo set as primary brand.');
    } else if (brand === 'dual') {
      certKhLogoWrapper?.classList.remove('hidden');
      certEetirpLogoWrapper?.classList.remove('hidden');
      certLogoDivider?.classList.remove('hidden');
      if (certOrg && inputOrg) {
        certOrg.textContent = 'KAURAHUB  ×  EETIRP';
        inputOrg.value = 'KAURAHUB  ×  EETIRP';
      }
      if (!silent) showToast('Dual Co-Branded Logos activated (KauraHub + EETIRP)!');
    }
  }

  brandSelectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setBrand(btn.getAttribute('data-brand'));
    });
  });

  // Initialize Dual Logos by default
  setBrand('dual', true);

  // Set Logo Mode (Badge / Clean Vector / Original Image)
  function setLogoMode(mode) {
    state.logoMode = mode;
    logoModeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });

    const wrappers = [certKhLogoWrapper, certEetirpLogoWrapper].filter(Boolean);
    wrappers.forEach(w => {
      w.classList.remove('logo-mode-vector-badge', 'logo-mode-vector-clean', 'logo-mode-image-original');
      w.classList.add(`logo-mode-${mode}`);
    });

    const colorWrapper = document.getElementById('logoColorWrapper');
    if (mode === 'image-original') {
      certKhSvg?.classList.add('hidden');
      certKhOriginalImg?.classList.remove('hidden');
      certEetirpSvg?.classList.add('hidden');
      certEetirpOriginalImg?.classList.remove('hidden');
      if (colorWrapper) colorWrapper.style.display = 'none';
      showToast('Switched to original uploaded raster graphics.');
    } else {
      certKhSvg?.classList.remove('hidden');
      certKhOriginalImg?.classList.add('hidden');
      certEetirpSvg?.classList.remove('hidden');
      certEetirpOriginalImg?.classList.add('hidden');
      if (colorWrapper) colorWrapper.style.display = 'flex';
      showToast(mode === 'vector-badge' ? 'Emblem Badge style activated.' : 'Clean Vector Mark activated.');
    }
  }

  logoModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setLogoMode(btn.getAttribute('data-mode'));
    });
  });

  // Set Logo Color Palette
  function setLogoColor(colorType, customHex = null) {
    state.logoColor = colorType;
    logoColorChips.forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('data-color') === colorType);
    });

    const wrappers = [certKhLogoWrapper, certEetirpLogoWrapper].filter(Boolean);
    wrappers.forEach(w => {
      w.classList.remove(
        'logo-color-original', 'logo-color-gold', 'logo-color-emerald',
        'logo-color-crimson', 'logo-color-monochrome'
      );
      if (colorType === 'custom' && customHex) {
        w.style.setProperty('--kh-accent-1', customHex);
        w.style.setProperty('--kh-accent-2', adjustBrightness(customHex, -30));
        w.style.setProperty('--kh-pillar-1', customHex);
        w.style.setProperty('--kh-pillar-2', adjustBrightness(customHex, -20));
        w.style.setProperty('--ee-accent-1', customHex);
        w.style.setProperty('--ee-accent-2', adjustBrightness(customHex, -30));
        w.style.setProperty('--ee-cyan-1', customHex);
        w.style.setProperty('border-color', customHex + '55', 'important');
      } else {
        w.style.removeProperty('--kh-accent-1');
        w.style.removeProperty('--kh-accent-2');
        w.style.removeProperty('--kh-pillar-1');
        w.style.removeProperty('--kh-pillar-2');
        w.style.removeProperty('--ee-accent-1');
        w.style.removeProperty('--ee-accent-2');
        w.style.removeProperty('--ee-cyan-1');
        w.style.removeProperty('border-color');
        w.classList.add(`logo-color-${colorType}`);
      }
    });
  }

  logoColorChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const color = chip.getAttribute('data-color');
      setLogoColor(color);
      showToast(`Logo color updated to ${color.toUpperCase()}!`);
    });
  });

  // Custom Color Picker
  if (customLogoColorInput) {
    customLogoColorInput.addEventListener('input', (e) => {
      const hex = e.target.value;
      if (customLogoColorHex) customLogoColorHex.textContent = hex;
      logoColorChips.forEach(chip => chip.classList.remove('active'));
      setLogoColor('custom', hex);
    });
  }

  // Size Slider
  if (logoSizeSlider) {
    logoSizeSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      if (logoSizeVal) logoSizeVal.textContent = `${val}px`;
      if (certKhLogoWrapper) certKhLogoWrapper.style.height = `${val}px`;
      if (certEetirpLogoWrapper) certEetirpLogoWrapper.style.height = `${val}px`;
    });
  }

  // Reset Logos
  if (resetKauraLogoBtn) {
    resetKauraLogoBtn.addEventListener('click', () => {
      if (certCustomLogo) certCustomLogo.classList.add('hidden');
      setBrand('dual');
      setLogoMode('vector-badge');
      setLogoColor('original');
      if (logoSizeSlider) {
        logoSizeSlider.value = 58;
        if (logoSizeVal) logoSizeVal.textContent = '58px';
        if (certKhLogoWrapper) certKhLogoWrapper.style.height = '58px';
        if (certEetirpLogoWrapper) certEetirpLogoWrapper.style.height = '58px';
      }
      showToast('Brand logos reset to default dual co-branded state!');
    });
  }

  // Upload Custom File Option
  if (logoUploadInput) {
    logoUploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          state.logo = event.target.result;
          if (certCustomLogo) {
            certCustomLogo.src = state.logo;
            certCustomLogo.classList.remove('hidden');
          }
          if (certKhLogoWrapper) certKhLogoWrapper.classList.add('hidden');
          if (certEetirpLogoWrapper) certEetirpLogoWrapper.classList.add('hidden');
          if (certLogoDivider) certLogoDivider.classList.add('hidden');
          showToast('Replacement logo uploaded successfully!');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // --- Comprehensive Signature Customization Engine ---
  function initSignatures() {
    let modalTargetSigner = 1;
    let modalActiveMethod = 'type';
    let modalActiveInk = '#0f172a';
    let modalActiveFont = "'Great Vibes', cursive";
    let modalActivePreset = 1;
    let modalUploadedData = null;

    const signModal = document.getElementById('signModal');
    const signModalTitle = document.getElementById('signModalTitle');
    const closeSignModal = document.getElementById('closeSignModal');
    const cancelSignModalBtn = document.getElementById('cancelSignModalBtn');
    const applySignModalBtn = document.getElementById('applySignModalBtn');
    const modalSigner1Btn = document.getElementById('modalSigner1Btn');
    const modalSigner2Btn = document.getElementById('modalSigner2Btn');
    const modalSignTextInput = document.getElementById('modalSignTextInput');

    // Drawing Canvas
    const drawCanvas = document.getElementById('modalDrawCanvas');
    const drawCtx = drawCanvas ? drawCanvas.getContext('2d') : null;
    let isDrawingLive = false;
    let drawPenWidth = 2.5;

    if (drawCtx) {
      drawCtx.strokeStyle = modalActiveInk;
      drawCtx.lineWidth = drawPenWidth;
      drawCtx.lineCap = 'round';
      drawCtx.lineJoin = 'round';

      function getDrawPos(e) {
        const rect = drawCanvas.getBoundingClientRect();
        const scaleX = drawCanvas.width / rect.width;
        const scaleY = drawCanvas.height / rect.height;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        return {
          x: (clientX - rect.left) * scaleX,
          y: (clientY - rect.top) * scaleY
        };
      }

      function startDraw(e) {
        isDrawingLive = true;
        const pos = getDrawPos(e);
        drawCtx.beginPath();
        drawCtx.moveTo(pos.x, pos.y);
        e.preventDefault();
      }

      function onDraw(e) {
        if (!isDrawingLive) return;
        const pos = getDrawPos(e);
        drawCtx.lineTo(pos.x, pos.y);
        drawCtx.stroke();
        e.preventDefault();
      }

      function endDraw() {
        isDrawingLive = false;
      }

      drawCanvas.addEventListener('mousedown', startDraw);
      drawCanvas.addEventListener('mousemove', onDraw);
      drawCanvas.addEventListener('mouseup', endDraw);
      drawCanvas.addEventListener('mouseleave', endDraw);

      drawCanvas.addEventListener('touchstart', startDraw, { passive: false });
      drawCanvas.addEventListener('touchmove', onDraw, { passive: false });
      drawCanvas.addEventListener('touchend', endDraw);

      const penWidthInput = document.getElementById('modalPenWidth');
      if (penWidthInput) {
        penWidthInput.addEventListener('input', (e) => {
          drawPenWidth = parseFloat(e.target.value);
          drawCtx.lineWidth = drawPenWidth;
        });
      }

      const clearDrawBtn = document.getElementById('modalClearDrawBtn');
      if (clearDrawBtn) {
        clearDrawBtn.addEventListener('click', () => {
          drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
        });
      }
    }

    // Open Modal Function
    function openSignModal(signerId = 1) {
      modalTargetSigner = signerId;
      signModalTitle.textContent = `Change Signature — Signatory ${signerId} (${signerId === 1 ? 'Left' : 'Right'})`;

      if (signerId === 1) {
        modalSigner1Btn.classList.add('active');
        modalSigner2Btn.classList.remove('active');
        modalSignTextInput.value = document.getElementById('certSigner1Name').textContent.trim() || 'Dr. Evelyn Vance';
      } else {
        modalSigner1Btn.classList.remove('active');
        modalSigner2Btn.classList.add('active');
        modalSignTextInput.value = document.getElementById('certSigner2Name').textContent.trim() || 'Marcus Sterling';
      }

      updateFontCardPreviews();
      signModal.classList.remove('hidden');

      if (window.lucide) {
        window.lucide.createIcons();
      }
    }

    // Switch between Signer 1 and Signer 2 inside modal
    modalSigner1Btn.addEventListener('click', () => {
      openSignModal(1);
    });
    modalSigner2Btn.addEventListener('click', () => {
      openSignModal(2);
    });

    closeSignModal.addEventListener('click', () => signModal.classList.add('hidden'));
    cancelSignModalBtn.addEventListener('click', () => signModal.classList.add('hidden'));

    // Direct click on certificate signature render area
    document.getElementById('signArea1')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openSignModal(1);
    });
    document.getElementById('signArea2')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openSignModal(2);
    });

    // Sidebar & trigger buttons
    document.querySelectorAll('.open-sign-modal-btn, .change-sign-float-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const signerId = parseInt(btn.getAttribute('data-signer') || '1', 10);
        openSignModal(signerId);
      });
    });

    // Method Tabs
    const methodBtns = document.querySelectorAll('.sign-method-nav .method-btn');
    methodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        methodBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const method = btn.getAttribute('data-method');
        modalActiveMethod = method;

        document.getElementById('methodTypePanel').classList.toggle('active', method === 'type');
        document.getElementById('methodDrawPanel').classList.toggle('active', method === 'draw');
        document.getElementById('methodPresetPanel').classList.toggle('active', method === 'preset');
        document.getElementById('methodUploadPanel').classList.toggle('active', method === 'upload');
      });
    });

    // Ink Palette
    const inkBtns = document.querySelectorAll('.ink-btn');
    inkBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        inkBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        modalActiveInk = btn.getAttribute('data-ink');

        // Update font preview text color
        document.querySelectorAll('.font-preview-card .preview-text').forEach(el => {
          el.style.color = modalActiveInk;
        });

        // Update canvas stroke color
        if (drawCtx) {
          drawCtx.strokeStyle = modalActiveInk;
        }

        // Update preset SVG color
        document.querySelectorAll('.preset-sign-svg').forEach(svg => {
          svg.style.color = modalActiveInk;
        });
      });
    });

    // Update Font Previews
    function updateFontCardPreviews() {
      const text = modalSignTextInput.value.trim() || 'Signature';
      document.querySelectorAll('.font-preview-card').forEach(card => {
        const textSpan = card.querySelector('.preview-text');
        if (textSpan) {
          textSpan.textContent = text;
          textSpan.style.color = modalActiveInk;
        }
      });
    }
    modalSignTextInput.addEventListener('input', updateFontCardPreviews);

    // Font Selection Cards
    document.querySelectorAll('.font-preview-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.font-preview-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        modalActiveFont = card.getAttribute('data-font');
      });
    });

    // Preset Signatures
    document.querySelectorAll('.preset-sign-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.preset-sign-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        modalActivePreset = parseInt(card.getAttribute('data-preset') || '1', 10);
      });
    });

    // Upload Signature
    const signUploadInput = document.getElementById('modalSignUploadInput');
    const uploadPreviewBox = document.getElementById('modalUploadPreviewBox');
    const uploadPreviewImg = document.getElementById('modalUploadPreviewImg');
    const removeUploadBtn = document.getElementById('modalRemoveUploadBtn');

    signUploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          modalUploadedData = evt.target.result;
          uploadPreviewImg.src = modalUploadedData;
          uploadPreviewBox.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      }
    });

    removeUploadBtn.addEventListener('click', () => {
      modalUploadedData = null;
      signUploadInput.value = '';
      uploadPreviewBox.classList.add('hidden');
    });

    // Apply Signature Button
    applySignModalBtn.addEventListener('click', () => {
      const sid = modalTargetSigner;
      const fontSpan = document.getElementById(`fontSign${sid}`);
      const imgElem = document.getElementById(`imgSign${sid}`);
      const svgBox = document.getElementById(`svgSign${sid}`);

      if (modalActiveMethod === 'type') {
        const text = modalSignTextInput.value.trim() || (sid === 1 ? 'Dr. Evelyn Vance' : 'Marcus Sterling');
        fontSpan.textContent = text;
        fontSpan.style.fontFamily = modalActiveFont;
        fontSpan.style.color = modalActiveInk;

        fontSpan.classList.remove('hidden');
        imgElem.classList.add('hidden');
        if (svgBox) svgBox.classList.add('hidden');

        // Sync sidebar dropdown
        const sidebarFontSelect = document.getElementById(`signer${sid}FontSelect`);
        if (sidebarFontSelect) {
          sidebarFontSelect.value = modalActiveFont;
        }

        showToast(`Signatory ${sid} calligraphy signature applied!`, 'success');

      } else if (modalActiveMethod === 'draw') {
        if (!drawCanvas) return;
        const dataUrl = drawCanvas.toDataURL('image/png');
        imgElem.src = dataUrl;
        imgElem.classList.remove('hidden');
        fontSpan.classList.add('hidden');
        if (svgBox) svgBox.classList.add('hidden');

        showToast(`Signatory ${sid} hand-drawn signature applied!`, 'success');

      } else if (modalActiveMethod === 'preset') {
        const chosenCard = document.querySelector(`.preset-sign-card[data-preset="${modalActivePreset}"]`);
        if (chosenCard && svgBox) {
          const svgContent = chosenCard.querySelector('svg').cloneNode(true);
          svgContent.style.color = modalActiveInk;
          svgContent.style.width = '100%';
          svgContent.style.height = '100%';
          svgBox.innerHTML = '';
          svgBox.appendChild(svgContent);

          svgBox.classList.remove('hidden');
          fontSpan.classList.add('hidden');
          imgElem.classList.add('hidden');

          showToast(`Executive preset signature applied to Signatory ${sid}!`, 'success');
        }

      } else if (modalActiveMethod === 'upload') {
        if (!modalUploadedData) {
          showToast('Please upload an image file first.', 'error');
          return;
        }
        imgElem.src = modalUploadedData;
        imgElem.classList.remove('hidden');
        fontSpan.classList.add('hidden');
        if (svgBox) svgBox.classList.add('hidden');

        showToast(`Signatory ${sid} uploaded image signature applied!`, 'success');
      }

      signModal.classList.add('hidden');
    });

    // Quick Sidebar Font Selectors
    const signer1FontSelect = document.getElementById('signer1FontSelect');
    if (signer1FontSelect) {
      signer1FontSelect.addEventListener('change', (e) => {
        const fontSpan = document.getElementById('fontSign1');
        const imgElem = document.getElementById('imgSign1');
        const svgBox = document.getElementById('svgSign1');
        fontSpan.style.fontFamily = e.target.value;
        fontSpan.classList.remove('hidden');
        imgElem.classList.add('hidden');
        if (svgBox) svgBox.classList.add('hidden');
      });
    }

    const signer2FontSelect = document.getElementById('signer2FontSelect');
    if (signer2FontSelect) {
      signer2FontSelect.addEventListener('change', (e) => {
        const fontSpan = document.getElementById('fontSign2');
        const imgElem = document.getElementById('imgSign2');
        const svgBox = document.getElementById('svgSign2');
        fontSpan.style.fontFamily = e.target.value;
        fontSpan.classList.remove('hidden');
        imgElem.classList.add('hidden');
        if (svgBox) svgBox.classList.add('hidden');
      });
    }

    // Toggle Second Signatory (Show / Hide)
    const toggleSigner2 = document.getElementById('toggleSigner2');
    const certSignBlock2 = document.getElementById('certSignBlock2');
    const signerCard2Wrapper = document.getElementById('signerCard2Wrapper');

    if (toggleSigner2 && certSignBlock2 && signerCard2Wrapper) {
      toggleSigner2.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        if (isChecked) {
          certSignBlock2.style.display = 'flex';
          signerCard2Wrapper.style.display = 'block';
          showToast('Second signatory enabled.');
        } else {
          certSignBlock2.style.display = 'none';
          signerCard2Wrapper.style.display = 'none';
          showToast('Second signatory hidden (Single signatory mode).');
        }
      });
    }
  }

  // --- Zoom Controls & Viewport Fit ---
  function setZoom(scale) {
    state.zoom = Math.max(0.35, Math.min(2.0, scale));
    certificateWrapper.style.transform = `scale(${state.zoom})`;
    zoomLevelSpan.textContent = `${Math.round(state.zoom * 100)}%`;
  }

  function autoFitZoom() {
    const vpWidth = certificateViewport.clientWidth - 80;
    const vpHeight = certificateViewport.clientHeight - 80;
    const isPortrait = state.orientation === 'portrait';
    const certWidth = isPortrait ? 707 : 1000;
    const certHeight = isPortrait ? 1000 : 707;

    const scaleX = vpWidth / certWidth;
    const scaleY = vpHeight / certHeight;
    const bestScale = Math.min(scaleX, scaleY, 1.05);

    setZoom(bestScale);
  }

  document.getElementById('zoomInBtn').addEventListener('click', () => setZoom(state.zoom + 0.1));
  document.getElementById('zoomOutBtn').addEventListener('click', () => setZoom(state.zoom - 0.1));
  document.getElementById('zoomFitBtn').addEventListener('click', autoFitZoom);
  window.addEventListener('resize', autoFitZoom);

  // --- Direct Print Action ---
  const printBtn = document.getElementById('printBtn');
  printBtn.addEventListener('click', () => {
    // Ensure all direct edit highlights are clean
    document.activeElement?.blur();
    window.print();
  });

  // --- Dropdown Menu for Download Exports ---
  const exportDropdownBtn = document.getElementById('exportDropdownBtn');
  const exportMenu = document.getElementById('exportMenu');

  exportDropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    exportDropdownBtn.parentElement.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!exportDropdownBtn.parentElement.contains(e.target)) {
      exportDropdownBtn.parentElement.classList.remove('open');
    }
  });

  // Helper to trigger safe file downloads
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      link.remove();
      URL.revokeObjectURL(url);
    }, 1000);
  }

  // --- High-Res Graphic Render (html2canvas helper) ---
  async function renderCertificateCanvas(scale = 2) {
    document.activeElement?.blur();
    const oldTransform = certificateWrapper.style.transform;
    certificateWrapper.style.transform = 'scale(1)';

    const isPortrait = state.orientation === 'portrait';
    const certWidth = isPortrait ? 707 : 1000;
    const certHeight = isPortrait ? 1000 : 707;

    try {
      const canvas = await html2canvas(certificateNode, {
        scale: scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: certWidth,
        height: certHeight,
        windowWidth: certWidth,
        windowHeight: certHeight,
        onclone: (clonedDoc) => {
          const clonedCert = clonedDoc.getElementById('certificateNode');
          if (clonedCert) {
            clonedCert.style.transform = 'none';
          }
          // Remove editable outlines in clone
          clonedDoc.querySelectorAll('.editable-element').forEach(el => {
            el.style.outline = 'none';
            el.style.boxShadow = 'none';
          });
          // Inline any SVG stop-colors that used CSS variables so html2canvas renders them flawlessly
          clonedDoc.querySelectorAll('stop').forEach(stop => {
            const stopColor = window.getComputedStyle(stop).stopColor;
            if (stopColor && stopColor !== 'none' && stopColor !== 'rgba(0, 0, 0, 0)') {
              stop.setAttribute('stop-color', stopColor);
            }
          });
        }
      });
      certificateWrapper.style.transform = oldTransform;
      return canvas;
    } catch (err) {
      certificateWrapper.style.transform = oldTransform;
      console.error('html2canvas render error:', err);
      throw err;
    }
  }

  // --- Download as PNG ---
  document.getElementById('downloadPngBtn').addEventListener('click', async () => {
    exportDropdownBtn.parentElement.classList.remove('open');
    showToast('Rendering ultra-sharp 300 DPI PNG...');
    try {
      const canvas = await renderCertificateCanvas(2.5);
      const recipient = (document.getElementById('inputRecipient')?.value || 'Certificate').trim().replace(/\s+/g, '_');
      const filename = `${recipient}_Certificate.png`;

      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, filename);
          showToast('PNG Certificate successfully downloaded!', 'success');
        } else {
          const link = document.createElement('a');
          link.download = filename;
          link.href = canvas.toDataURL('image/png');
          document.body.appendChild(link);
          link.click();
          setTimeout(() => link.remove(), 500);
          showToast('PNG Certificate downloaded!', 'success');
        }
      }, 'image/png');
    } catch (err) {
      console.error(err);
      showToast('Export issue. Use browser Print to save as PDF or Image.', 'error');
    }
  });

  // --- Download as JPEG ---
  document.getElementById('downloadJpgBtn').addEventListener('click', async () => {
    exportDropdownBtn.parentElement.classList.remove('open');
    showToast('Generating high-quality JPEG...');
    try {
      const canvas = await renderCertificateCanvas(2.2);
      const recipient = (document.getElementById('inputRecipient')?.value || 'Certificate').trim().replace(/\s+/g, '_');
      const filename = `${recipient}_Certificate.jpg`;

      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, filename);
          showToast('JPEG Certificate downloaded!', 'success');
        } else {
          const link = document.createElement('a');
          link.download = filename;
          link.href = canvas.toDataURL('image/jpeg', 0.95);
          document.body.appendChild(link);
          link.click();
          setTimeout(() => link.remove(), 500);
          showToast('JPEG Certificate downloaded!', 'success');
        }
      }, 'image/jpeg', 0.95);
    } catch (err) {
      console.error(err);
      showToast('Export failed.', 'error');
    }
  });

  // --- Download as PDF Document ---
  document.getElementById('downloadPdfBtn').addEventListener('click', async () => {
    exportDropdownBtn.parentElement.classList.remove('open');
    showToast('Preparing professional printable PDF...');
    try {
      const canvas = await renderCertificateCanvas(2.2);
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      const isPortrait = state.orientation === 'portrait';
      const jsPdfConstructor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
      if (!jsPdfConstructor) {
        throw new Error('jsPDF library not loaded');
      }

      const pdf = new jsPdfConstructor({
        orientation: isPortrait ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      const recipient = (document.getElementById('inputRecipient')?.value || 'Certificate').trim().replace(/\s+/g, '_');
      pdf.save(`${recipient}_Certificate.pdf`);
      showToast('A4 Printable PDF downloaded!', 'success');
    } catch (err) {
      console.error(err);
      showToast('PDF export issue. Opening browser print-to-PDF...', 'error');
      setTimeout(() => window.print(), 600);
    }
  });

  // --- Reset Certificate ---
  document.getElementById('resetCertificateBtn').addEventListener('click', () => {
    if (confirm('Reset certificate text and styles to initial defaults?')) {
      presetSelect.value = 'completion';
      presetSelect.dispatchEvent(new Event('change'));
      showToast('Certificate restored to original defaults.');
    }
  });

  // --- Bulk / Batch Mode Modal ---
  const batchModal = document.getElementById('batchModal');
  const batchModalBtn = document.getElementById('batchModalBtn');
  const closeBatchModal = document.getElementById('closeBatchModal');
  const cancelBatchBtn = document.getElementById('cancelBatchBtn');
  const batchNames = document.getElementById('batchNames');
  const batchStatus = document.getElementById('batchStatus');
  const batchProgressBar = document.getElementById('batchProgressBar');
  const batchStatusText = document.getElementById('batchStatusText');

  batchModalBtn.addEventListener('click', () => batchModal.classList.remove('hidden'));
  closeBatchModal.addEventListener('click', () => batchModal.classList.add('hidden'));
  cancelBatchBtn.addEventListener('click', () => batchModal.classList.add('hidden'));

  function getBatchNameList() {
    return batchNames.value
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);
  }

  // Preview first name
  document.getElementById('previewBatchBtn').addEventListener('click', () => {
    const names = getBatchNameList();
    if (names.length === 0) {
      showToast('Please enter at least one name in the list.', 'error');
      return;
    }
    document.getElementById('inputRecipient').value = names[0];
    document.getElementById('certRecipient').textContent = names[0];
    batchModal.classList.add('hidden');
    showToast(`Loaded "${names[0]}" into active certificate preview.`);
  });

  // Batch Print
  document.getElementById('startBatchPrintBtn').addEventListener('click', () => {
    const names = getBatchNameList();
    if (names.length === 0) {
      showToast('Please enter at least one name.', 'error');
      return;
    }

    const batchPrintContainer = document.getElementById('batchPrintContainer');
    batchPrintContainer.innerHTML = '';

    names.forEach((name, idx) => {
      // Clone certificate node
      const clone = certificateNode.cloneNode(true);
      clone.id = `batchCert_${idx}`;
      const rec = clone.querySelector('#certRecipient');
      if (rec) rec.textContent = name;
      const idSpan = clone.querySelector('#certIdSpan');
      if (idSpan) {
        idSpan.textContent = `CERT-2026-${(1000 + idx).toString()}`;
      }
      batchPrintContainer.appendChild(clone);
    });

    document.body.classList.add('printing-batch');
    batchModal.classList.add('hidden');

    window.print();

    // Cleanup after print dialog
    setTimeout(() => {
      document.body.classList.remove('printing-batch');
      batchPrintContainer.innerHTML = '';
    }, 1000);
  });

  // Batch Multi-Page PDF Download
  document.getElementById('startBatchPdfBtn').addEventListener('click', async () => {
    const names = getBatchNameList();
    if (names.length === 0) {
      showToast('Please enter at least one name.', 'error');
      return;
    }

    batchStatus.classList.remove('hidden');
    const isPortrait = state.orientation === 'portrait';
    const jsPdfConstructor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    if (!jsPdfConstructor) {
      showToast('jsPDF library not available. Please use batch print.', 'error');
      batchStatus.classList.add('hidden');
      return;
    }
    const pdf = new jsPdfConstructor({
      orientation: isPortrait ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const originalName = document.getElementById('certRecipient').textContent;
    const originalInput = document.getElementById('inputRecipient').value;

    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      batchStatusText.textContent = `Rendering ${i + 1} of ${names.length}: ${name}...`;
      batchProgressBar.style.width = `${Math.round(((i + 1) / names.length) * 100)}%`;

      document.getElementById('certRecipient').textContent = name;
      document.getElementById('inputRecipient').value = name;

      // Render page
      const canvas = await renderCertificateCanvas(2.2);
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    // Restore original name
    document.getElementById('certRecipient').textContent = originalName;
    document.getElementById('inputRecipient').value = originalInput;

    pdf.save(`Certificates_Batch_${names.length}_Recipients.pdf`);
    batchStatus.classList.add('hidden');
    batchModal.classList.add('hidden');
    showToast(`Compiled multi-page PDF with ${names.length} certificates!`, 'success');
  });

  // --- Toast Notifications Helper ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-circle';

    toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    if (window.lucide) {
      window.lucide.createIcons({ root: toast });
    }

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- Initial Setup ---
  initDataBinding();
  initSignatures();
  autoFitZoom();

  // Welcome Toast
  setTimeout(() => {
    showToast('Welcome to CertiCraft Studio! Click any text on the certificate or use the sidebar to customize.');
  }, 600);
});
