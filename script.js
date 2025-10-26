document.addEventListener('DOMContentLoaded', () => {
   const PROGRAM = {
      dimanche: {
         key: 'dimanche',
         title: "Dimanche - Dos + Jambes Lourdes",
         exercises: [
            { name: "Trap Bar Deadlift", sets: 4, reps: "6-8", rest: 150, weight: 75, type: "barre", tech: "Tempo 3-1-2" },
            { name: "Goblet Squat", sets: 3, reps: "10", rest: 90, weight: 25, type: "haltères", tech: "Tempo 3-1-2" },
            { name: "Lat Pulldown", sets: 3, reps: "10", rest: 90, weight: 60, type: "machine", tech: "Tempo 2-1-2" },
            { name: "Leg Press", sets: 3, reps: "12", rest: 120, weight: 110, type: "machine", tech: "Tempo 2-1-2" },
            { name: "Landmine Press", sets: 3, reps: "10", rest: 120, weight: 40, type: "barre", tech: "Standard" },
            { name: "Incline Curl", sets: 2, reps: "12", rest: 75, weight: 14, type: "haltères", tech: "Tempo 2-1-2" },
            { name: "Reverse Curl", sets: 2, reps: "15", rest: 75, weight: 8, type: "haltères", tech: "Tempo 3-1-2" }
         ]
      },
      mardi: {
         key: 'mardi',
         title: "Mardi - Pecs + Épaules + Bras",
         exercises: [
            { name: "Dumbbell Press", sets: 3, reps: "10", rest: 120, weight: 22, type: "haltères", tech: "Tempo 2-1-2" },
            { name: "Close-Grip Bench Press", sets: 3, reps: "10", rest: 90, weight: 70, type: "barre", tech: "Standard" },
            { name: "Lateral Raises", sets: 3, reps: "15", rest: 60, weight: 8, type: "haltères", tech: "Tempo 2-1-2" },
            { name: "Face Pull", sets: 3, reps: "15", rest: 60, weight: 20, type: "machine", tech: "Tempo 3-1-2" },
            { name: "Cable Curl", sets: 3, reps: "12", rest: 75, weight: 25, type: "machine", tech: "Standard" },
            { name: "Rope Hammer Curl", sets: 2, reps: "15", rest: 60, weight: 12, type: "machine", tech: "Standard" },
            { name: "Triceps Pushdown", sets: 2, reps: "12", rest: 60, weight: 25, type: "machine", tech: "Standard" }
         ]
      },
      vendredi: {
         key: 'vendredi',
         title: "Vendredi - Dos + Jambes Légères + Bras",
         exercises: [
            { name: "Landmine Row", sets: 3, reps: "10", rest: 120, weight: 50, type: "barre", tech: "Tempo 2-1-2" },
            { name: "Leg Curl", sets: 3, reps: "12", rest: 90, weight: 35, type: "machine", tech: "Tempo 3-1-2" },
            { name: "Leg Extension", sets: 3, reps: "15", rest: 75, weight: 40, type: "machine", tech: "Standard" },
            { name: "Dumbbell Fly", sets: 3, reps: "12", rest: 75, weight: 12, type: "haltères", tech: "Tempo 3-1-2" },
            { name: "EZ Bar Curl", sets: 3, reps: "12", rest: 60, weight: 30, type: "barre", tech: "Standard" },
            { name: "Wrist Curl", sets: 3, reps: "20", rest: 45, weight: 8, type: "barre", tech: "Standard" }
         ]
      }
   };

   const STATE_KEY = 'hm51_v5';
   let state, currentSessionKey, timerInterval;

   function defaultState() {
       const weights = {};
       Object.values(PROGRAM).forEach(s => s.exercises.forEach(e => weights[e.name] = e.weight));
       return { 
           week: 1, 
           weights, 
           hist: {}, 
           program: JSON.parse(JSON.stringify(PROGRAM)),
           customExercises: [] // NOUVEAU : Exercices personnalisés
       };
   }

   function loadState() {
       try {
           const raw = localStorage.getItem(STATE_KEY);
           if (raw) {
               const loaded = JSON.parse(raw);
               if (!loaded.customExercises) loaded.customExercises = [];
               return loaded;
           }
           return defaultState();
       } catch (e) {
           return defaultState();
       }
   }

   function saveState() {
       localStorage.setItem(STATE_KEY, JSON.stringify(state));
   }

   function showScreen(id) {
       document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
       document.getElementById(id).classList.add("active");
   }

   function showQuickMsg(msg) {
       const el = document.getElementById('quickMsg');
       if (!el) return;
       el.textContent = msg;
       el.style.color = '#10b981';
       setTimeout(() => { el.textContent = 'Prêt.'; el.style.color = ''; }, 3000);
   }

   function getBlockInfo(week) {
       if (week <= 5) return { name: 'Bloc 1 - Fondation', tech: 'Tempo contrôlé' };
       if (week <= 11) return { name: 'Bloc 2 - Surcharge', tech: 'Rest-Pause' };
       return { name: 'Bloc 3 - Intensification', tech: 'Drop-sets + Myo-reps' };
   }

   // NOUVEAU : Récupérer dernière performance
   function getLastPerformance(exName) {
       const hist = state.hist[exName];
       if (!hist || hist.length === 0) return null;
       return hist[hist.length - 1];
   }

   function renderHeader() {
       document.getElementById('weekDisplay').textContent = state.week;
       const block = getBlockInfo(state.week);
       document.getElementById('blockName').textContent = block.name;
   }

   function renderProgramList() {
       const progList = document.getElementById('progList');
       progList.innerHTML = '';
       
       Object.values(state.program).forEach(s => {
           const btn = document.createElement('button');
           btn.className = 'session-btn';
           
           const exCount = s.exercises.length;
           const totalSets = s.exercises.reduce((sum, ex) => sum + ex.sets, 0);
           
           btn.innerHTML = `
               <div style="font-size:18px;font-weight:700;margin-bottom:8px">${s.title}</div>
               <div style="font-size:14px;opacity:0.9">${exCount} exercices • ${totalSets} séries</div>
           `;
           
           btn.onclick = () => openSession(s.key);
           progList.appendChild(btn);
       });
   }

   window.backHome = function() {
       showScreen("home");
       renderHeader();
       renderProgramList();
   };

   function openSession(key) {
       currentSessionKey = key;
       showScreen('session');
       const block = getBlockInfo(state.week);
       document.getElementById('sessionTitle').textContent = state.program[key].title;
       const list = document.getElementById('exerciseList');
       list.innerHTML = '';

       state.program[key].exercises.forEach(ex => {
           const w = state.weights[ex.name] || ex.weight;
           const exId = ex.name.replace(/[^a-zA-Z0-9]/g, '');
           
           // NOUVEAU : Récupérer dernière perf
           const lastPerf = getLastPerformance(ex.name);
           let perfBadge = '';
           if (lastPerf) {
               perfBadge = `<div style="font-size:13px;color:#10b981;margin-top:4px">📊 Dernier: ${lastPerf.weight}kg × ${lastPerf.reps} reps</div>`;
           }
           
           const card = document.createElement('div');
           card.className = 'exercise-card';
           card.innerHTML = `
               <div class="exercise-header" onclick="toggleExerciseDetails('${exId}')">
                   <div style="flex:1">
                       <div class="exercise-name">${ex.name}</div>
                       <div class="exercise-meta">${ex.sets} séries × ${ex.reps} reps • ${ex.rest}s repos • ${w}kg</div>
                       ${perfBadge}
                   </div>
                   <div class="exercise-arrow" id="arrow-${exId}">▼</div>
               </div>
               <div class="exercise-details" id="details-${exId}"></div>
           `;
           list.appendChild(card);
       });
   }

   window.toggleExerciseDetails = (exId) => {
       const details = document.getElementById(`details-${exId}`);
       const arrow = document.getElementById(`arrow-${exId}`);
       const wasOpen = details.classList.contains('open');

       document.querySelectorAll('.exercise-details.open').forEach(d => {
           if (d.id !== `details-${exId}`) {
               d.classList.remove('open');
               const a = document.getElementById(`arrow-${d.id.substring(8)}`);
               if (a) a.classList.remove('open');
           }
       });

       if (!wasOpen) {
           const exName = details.previousElementSibling.querySelector('.exercise-name').textContent;
           const ex = state.program[currentSessionKey].exercises.find(e => e.name === exName);
           renderExerciseDetails(ex);
           details.classList.add('open');
           arrow.classList.add('open');
       } else {
           details.innerHTML = '';
           details.classList.remove('open');
           arrow.classList.remove('open');
       }
   };

   function renderExerciseDetails(ex) {
       const exId = ex.name.replace(/[^a-zA-Z0-9]/g, '');
       const details = document.getElementById(`details-${exId}`);
       const w = state.weights[ex.name] || ex.weight;
       const block = getBlockInfo(state.week);
       const lastPerf = getLastPerformance(ex.name);

       let techBanner = ex.tech;
       if (state.week > 5 && state.week <= 11) {
           techBanner = `${ex.tech} + Rest-Pause (dernière série)`;
       } else if (state.week > 11) {
           techBanner = `${ex.tech} + Drop-sets + Myo-reps`;
       }

       // NOUVEAU : Message de performance précédente
       let perfMsg = '';
       if (lastPerf) {
           perfMsg = `<div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);color:#10b981;padding:12px 16px;border-radius:10px;margin-bottom:16px;font-size:14px;font-weight:600">
               📊 Dernière fois : ${lastPerf.weight}kg × ${lastPerf.reps} reps (Semaine ${lastPerf.week})
           </div>`;
       } else {
           perfMsg = `<div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);color:var(--accent);padding:12px 16px;border-radius:10px;margin-bottom:16px;font-size:14px;font-weight:600">
               ⭐ Première fois pour cet exercice !
           </div>`;
       }

       let setsHtml = '';
       for (let i = 1; i <= ex.sets; i++) {
           setsHtml += `
               <div class="set-row">
                   <div class="set-label">Série ${i}</div>
                   <div>
                       <label class="input-label">KG</label>
                       <input type="number" value="${w}" class="set-input w-${exId}-${i}" step="0.5" placeholder="Poids">
                   </div>
                   <div>
                       <label class="input-label">REPS</label>
                       <input type="number" value="${ex.reps}" class="set-input r-${exId}-${i}" placeholder="Reps">
                   </div>
                   <div>
                       <input type="checkbox" id="s-${i}-${exId}" class="set-checkbox">
                       <label for="s-${i}-${exId}"></label>
                   </div>
               </div>
           `;
       }

       details.innerHTML = `
           <div class="technique-banner">✨ ${techBanner}</div>
           ${perfMsg}
           ${setsHtml}
           <div class="exercise-actions">
               <button class="btn-secondary" onclick="modifyWeight('${ex.name}')">✏️ Modifier Poids</button>
               <button class="btn-save" onclick="savePerf('${ex.name}')">💾 Enregistrer & Valider</button>
           </div>
       `;

       document.querySelectorAll(`#details-${exId} .set-checkbox`).forEach((cb, idx) => {
           cb.addEventListener('change', function() {
               if (this.checked) {
                   const isLast = idx === ex.sets - 1;
                   const nextText = isLast ? "Prochain exercice" : "Repos";
                   startTimer(ex.rest, nextText);
               }
           });
       });
   }

   function startTimer(duration, next) {
       clearInterval(timerInterval);
       const timer = document.getElementById('restTimer');
       const text = document.getElementById('timerText');
       const circle = document.getElementById('timerProgressCircle');
       document.getElementById('nextExerciseName').textContent = next;
       timer.classList.add('visible');

       let left = duration;
       const circ = 226;

       const update = () => {
           text.textContent = `${Math.floor(left/60)}:${(left%60).toString().padStart(2,'0')}`;
           circle.style.strokeDashoffset = circ - (left/duration)*circ;
           if (left <= 0) {
               clearInterval(timerInterval);
               timer.classList.remove('visible');
               // AMÉLIORATION : Vibration + Son plus fort
               if (navigator.vibrate) {
                   navigator.vibrate([400, 200, 400, 200, 400]);
               }
               playBeep();
           } else {
               left--;
           }
       };

       update();
       timerInterval = setInterval(update, 1000);
   }

   // NOUVEAU : Son de fin de repos
   function playBeep() {
       const audioContext = new (window.AudioContext || window.webkitAudioContext)();
       const oscillator = audioContext.createOscillator();
       const gainNode = audioContext.createGain();
       
       oscillator.connect(gainNode);
       gainNode.connect(audioContext.destination);
       
       oscillator.frequency.value = 800;
       oscillator.type = 'sine';
       
       gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
       gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
       
       oscillator.start(audioContext.currentTime);
       oscillator.stop(audioContext.currentTime + 0.5);
   }

   document.getElementById('skipTimerBtn').addEventListener('click', () => {
       clearInterval(timerInterval);
       document.getElementById('restTimer').classList.remove('visible');
   });

   window.modifyWeight = function(exName) {
       const w = state.weights[exName];
       openModal(`
           <h3 style="font-weight:700;font-size:20px;margin-bottom:16px;color:var(--accent)">✏️ Modifier le poids</h3>
           <div style="text-align:center;margin-bottom:16px;color:var(--text-secondary);font-size:16px">${exName}</div>
           <input type="number" id="newW" class="set-input" value="${w}" step="0.5" style="width:100%;font-size:24px;margin-bottom:20px;padding:18px"/>
           <div style="display:flex;gap:12px">
               <button class="btn-save" onclick="saveWeight('${exName}')" style="flex:1;padding:16px">💾 Enregistrer</button>
               <button class="btn-secondary" onclick="closeModal()" style="flex:1;padding:16px">❌ Annuler</button>
           </div>
       `);
       setTimeout(() => {
           const input = document.getElementById('newW');
           if (input) {
               input.focus();
               input.select();
           }
       }, 100);
   };

   window.saveWeight = function(exName) {
       const nw = parseFloat(document.getElementById('newW').value);
       if (!isNaN(nw) && nw >= 0) {
           const oldWeight = state.weights[exName];
           state.weights[exName] = nw;
           saveState();
           showQuickMsg(`✓ ${exName}: ${oldWeight}kg → ${nw}kg`);
           closeModal();
           setTimeout(() => openSession(currentSessionKey), 300);
       } else {
           showQuickMsg('⚠️ Poids invalide');
       }
   };

   window.savePerf = function(exName) {
       const exId = exName.replace(/[^a-zA-Z0-9]/g, '');
       const ex = state.program[currentSessionKey].exercises.find(e => e.name === exName);
       if (!ex) return;

       let sets = [];
       for (let i = 1; i <= ex.sets; i++) {
           const wInput = document.querySelector(`.w-${exId}-${i}`);
           const rInput = document.querySelector(`.r-${exId}-${i}`);
           if (!wInput || !rInput) continue;

           const w = parseFloat(wInput.value) || 0;
           const r = parseInt(rInput.value) || 0;
           if (r > 0) sets.push({ w, r });
       }

       if (sets.length === 0) {
           return showQuickMsg("⚠️ Entrez au moins une répétition");
       }

       const best = sets.reduce((a,b) => b.r > a.r ? b : a);
       state.hist[exName] = state.hist[exName] || [];
       state.hist[exName].push({ 
           week: state.week, 
           weight: best.w, 
           reps: best.r, 
           ts: Date.now(),
           allSets: sets // NOUVEAU : Sauvegarder toutes les séries
       });
       state.weights[exName] = best.w;
       saveState();
       showQuickMsg(`✅ ${exName}: ${sets.length} série(s) • ${best.r} reps @ ${best.w}kg`);
   };

   function openModal(html) {
       document.getElementById('modal').classList.add('active');
       document.getElementById('modalContent').innerHTML = html;
   }

   window.closeModal = function() {
       document.getElementById('modal').classList.remove('active');
       document.getElementById('modalContent').innerHTML = '';
   };

   // NOUVEAU : Créer un exercice personnalisé
   window.createCustomExercise = function() {
       openModal(`
           <h3 style="font-weight:700;font-size:20px;margin-bottom:20px;color:var(--accent)">➕ Nouvel Exercice</h3>
           <div style="display:flex;flex-direction:column;gap:16px">
               <div>
                   <label class="input-label">Nom de l'exercice</label>
                   <input type="text" id="customExName" class="set-input" placeholder="Ex: Squat Bulgare" style="width:100%;padding:14px"/>
               </div>
               <div>
                   <label class="input-label">Type</label>
                   <select id="customExType" class="set-input" style="width:100%;padding:14px">
                       <option value="haltères">Haltères</option>
                       <option value="barre">Barre</option>
                       <option value="machine">Machine</option>
                       <option value="poids du corps">Poids du corps</option>
                   </select>
               </div>
               <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                   <div>
                       <label class="input-label">Séries</label>
                       <input type="number" id="customExSets" class="set-input" value="3" min="1" style="width:100%;padding:14px"/>
                   </div>
                   <div>
                       <label class="input-label">Reps</label>
                       <input type="text" id="customExReps" class="set-input" value="10" placeholder="Ex: 8-12" style="width:100%;padding:14px"/>
                   </div>
               </div>
               <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                   <div>
                       <label class="input-label">Repos (sec)</label>
                       <input type="number" id="customExRest" class="set-input" value="90" min="0" style="width:100%;padding:14px"/>
                   </div>
                   <div>
                       <label class="input-label">Poids (kg)</label>
                       <input type="number" id="customExWeight" class="set-input" value="20" step="0.5" min="0" style="width:100%;padding:14px"/>
                   </div>
               </div>
           </div>
           <div style="display:flex;gap:12px;margin-top:24px">
               <button class="btn-save" onclick="saveCustomExercise()" style="flex:1;padding:16px">💾 Créer</button>
               <button class="btn-secondary" onclick="closeModal()" style="flex:1;padding:16px">❌ Annuler</button>
           </div>
       `);
   };

   window.saveCustomExercise = function() {
       const name = document.getElementById('customExName').value.trim();
       const type = document.getElementById('customExType').value;
       const sets = parseInt(document.getElementById('customExSets').value);
       const reps = document.getElementById('customExReps').value.trim();
       const rest = parseInt(document.getElementById('customExRest').value);
       const weight = parseFloat(document.getElementById('customExWeight').value);

       if (!name) {
           return alert('⚠️ Nom requis');
       }

       const newEx = {
           name,
           type,
           sets,
           reps,
           rest,
           weight,
           tech: 'Standard',
           custom: true
       };

       state.customExercises.push(newEx);
       state.weights[name] = weight;
       saveState();
       showQuickMsg(`✅ Exercice "${name}" créé !`);
       closeModal();
   };

   // NOUVEAU : Voir exercices personnalisés
   window.viewCustomExercises = function() {
       let html = '<h3 style="font-weight:700;margin-bottom:20px;color:var(--accent);font-size:20px">💪 Mes Exercices</h3>';
       
       if (state.customExercises.length === 0) {
           html += '<div style="text-align:center;color:var(--text-secondary);padding:20px">Aucun exercice personnalisé</div>';
       } else {
           html += '<div style="display:flex;flex-direction:column;gap:10px">';
           state.customExercises.forEach((ex, idx) => {
               html += `<div style="padding:14px;background:var(--bg-card-light);border-radius:10px;border:1px solid var(--border)">
                   <div style="font-weight:700;margin-bottom:4px">${ex.name}</div>
                   <div style="font-size:13px;color:var(--text-secondary)">${ex.sets}×${ex.reps} • ${ex.rest}s • ${ex.weight}kg • ${ex.type}</div>
               </div>`;
           });
           html += '</div>';
       }
       
       html += `<button class="btn-save" onclick="createCustomExercise()" style="margin-top:20px;width:100%;padding:16px">➕ Nouvel Exercice</button>`;
       html += '<button class="btn-secondary" onclick="closeModal()" style="margin-top:12px;width:100%;padding:16px">Fermer</button>';
       openModal(html);
   };

   document.getElementById('openStats').addEventListener('click', () => {
       let h = '<h3 style="font-weight:700;margin-bottom:20px;color:var(--accent);font-size:20px">📊 Poids Actuels</h3><div style="display:flex;flex-direction:column;gap:10px">';
       Object.entries(state.weights).forEach(([n,w]) => {
           h += `<div style="display:flex;justify-content:space-between;padding:14px;background:var(--bg-card-light);border-radius:10px;border:1px solid var(--border);font-size:15px"><span>${n}</span><strong style="color:var(--accent)">${w}kg</strong></div>`;
       });
       h += '</div>';
       h += '<button class="btn-secondary" onclick="viewCustomExercises()" style="margin-top:16px;width:100%;padding:16px">💪 Mes Exercices</button>';
       h += '<button class="btn-save" onclick="closeModal()" style="margin-top:12px;width:100%;padding:16px">Fermer</button>';
       openModal(h);
   });

   // NOUVEAU : Export complet
   document.getElementById('exportWeights').addEventListener('click', () => {
       let csv = 'Exercise,Week,Set,Reps,Weight(kg),Date\n';
       Object.entries(state.hist).forEach(([exName, records]) => {
           records.forEach(r => {
               const date = new Date(r.ts).toLocaleDateString('fr-FR');
               if (r.allSets && r.allSets.length > 0) {
                   r.allSets.forEach((set, idx) => {
                       csv += `"${exName}",${r.week},${idx + 1},${set.r},${set.w},${date}\n`;
                   });
               } else {
                   csv += `"${exName}",${r.week},1,${r.reps},${r.weight},${date}\n`;
               }
           });
       });
       const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
       const a = document.createElement('a');
       a.href = URL.createObjectURL(blob);
       a.download = `hybrid_master_51_COMPLET_${new Date().toISOString().split('T')[0]}.csv`;
       a.click();
       showQuickMsg('✓ Export complet réussi !');
   });

   document.getElementById('resetApp').addEventListener('click', () => {
       if (confirm('⚠️ Réinitialiser toutes les données ? Cette action est irréversible.')) {
           localStorage.removeItem(STATE_KEY);
           location.reload();
       }
   });

   document.getElementById('advanceWeek').addEventListener('click', () => {
       if (state.week < 26) {
           state.week++;
           saveState();
           renderHeader();
           showQuickMsg(`✓ Semaine ${state.week}`);
       } else {
           showQuickMsg('🎉 Programme terminé !');
       }
   });

   document.getElementById('prevWeek').addEventListener('click', () => {
       if (state.week > 1) {
           state.week--;
           saveState();
           renderHeader();
           showQuickMsg(`✓ Semaine ${state.week}`);
       }
   });

   document.getElementById('backHomeBtn').addEventListener('click', window.backHome);

   state = loadState();
   renderHeader();
   renderProgramList();
});
