    // ═══════════════════════════════════════════════════════════
    // MAPA
    // ═══════════════════════════════════════════════════════════
    const map = L.map('map', { center: [19.235, -103.755], zoom: 12, zoomControl: true, attributionControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    map.on('mousemove', e => {
      document.getElementById('bottom-coords').textContent =
        `lat ${e.latlng.lat.toFixed(5)}  lng ${e.latlng.lng.toFixed(5)}`;
    });

    // ═══════════════════════════════════════════════════════════
    // GATEWAYS — 9 puntos en ubicaciones reales de Colima
    // ═══════════════════════════════════════════════════════════
    const GWS = [
      { id: 'GW-1', name: 'Cerro La Albarrada', lat: 19.2720, lng: -103.7210 },
      { id: 'GW-2', name: 'Tec de Colima', lat: 19.2480, lng: -103.7050 },
      { id: 'GW-3', name: 'Palacio de Gobierno', lat: 19.2435, lng: -103.7260 },
      { id: 'GW-4', name: 'Central Camionera', lat: 19.2330, lng: -103.7430 },
      { id: 'GW-5', name: 'Hospital IMSS', lat: 19.2380, lng: -103.7170 },
      { id: 'GW-6', name: 'Plaza Colima', lat: 19.2280, lng: -103.7130 },
      { id: 'GW-7', name: 'VdA — Paseo M. Madrid', lat: 19.2600, lng: -103.7380 },
      { id: 'GW-8', name: 'VdA — Av. Las Torres', lat: 19.2460, lng: -103.7480 },
      { id: 'GW-9', name: 'Periférico Sur', lat: 19.2200, lng: -103.7290 },
    ];
    const GW_RADIUS = 2000; // metros
    const gwPkts = Object.fromEntries(GWS.map(g => [g.id, 0]));

    // Cobertura visual
    GWS.forEach((gw, i) => {
      const h = (i * 37) % 360;
      const c = `hsl(${h},75%,60%)`;
      L.circle([gw.lat, gw.lng], {
        radius: GW_RADIUS, color: c, weight: 1.5, opacity: 0.35,
        fillColor: c, fillOpacity: 0.04,
      }).addTo(map).bindTooltip(`${gw.id} · ${gw.name}`, { sticky: true });

      const icon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;border-radius:50%;background:rgba(10,14,39,0.95);border:2px solid ${c};display:flex;align-items:center;justify-content:center;font-family:'Orbitron',sans-serif;font-size:7px;font-weight:900;color:${c};box-shadow:0 0 10px ${c}55">${gw.id.replace('GW-', 'G')}</div>`,
        iconSize: [28, 28], iconAnchor: [14, 14],
      });
      L.marker([gw.lat, gw.lng], { icon }).addTo(map)
        .bindTooltip(`<b>${gw.id}</b> · ${gw.name}`, { direction: 'top', offset: [0, -18] });
    });

    // GW grid en sidebar
    const gwGrid = document.getElementById('gw-grid');
    GWS.forEach(gw => {
      const d = document.createElement('div');
      d.className = 'gw-item'; d.id = `gw-item-${gw.id}`;
      d.innerHTML = `<div class="gw-id">${gw.id}</div><div class="gw-pkts" id="gw-pkts-${gw.id}">0</div><div class="gw-lbl">paquetes</div>`;
      gwGrid.appendChild(d);
    });

    // ═══════════════════════════════════════════════════════════
    // RUTAS — números reales de TransCol Colima (SEMOV)
    // Waypoints clave sobre calles reales; OSRM los conecta sobre la red vial
    // ═══════════════════════════════════════════════════════════
    const ROUTE_DEFS = [
      {
        id: 'R1', label: 'Ruta 1', busCount: 4,
        color: '#FF4C6A', speedKmh: 32,
        waypoints: [
          [19.2720, -103.7380], [19.2640, -103.7280], [19.2560, -103.7200],
          [19.2480, -103.7130], [19.2420, -103.7080], [19.2370, -103.7130],
          [19.2320, -103.7220], [19.2290, -103.7330], [19.2330, -103.7430],
          [19.2430, -103.7470], [19.2560, -103.7440], [19.2680, -103.7420], [19.2720, -103.7380],
        ],
      },
      {
        id: 'R2', label: 'Ruta 2', busCount: 3,
        color: '#ff7b92', speedKmh: 30,
        waypoints: [
          [19.2650, -103.7300], [19.2580, -103.7230], [19.2500, -103.7160],
          [19.2440, -103.7110], [19.2380, -103.7130], [19.2330, -103.7200],
          [19.2300, -103.7320], [19.2320, -103.7420], [19.2410, -103.7460], [19.2520, -103.7430], [19.2650, -103.7300],
        ],
      },
      {
        id: 'R3', label: 'Ruta 3', busCount: 3,
        color: '#FF8C00', speedKmh: 28,
        waypoints: [
          [19.2600, -103.7390], [19.2540, -103.7330], [19.2470, -103.7270],
          [19.2410, -103.7210], [19.2360, -103.7170], [19.2310, -103.7240],
          [19.2280, -103.7340], [19.2310, -103.7440], [19.2400, -103.7490], [19.2530, -103.7460], [19.2600, -103.7390],
        ],
      },
      {
        id: 'R4', label: 'Ruta 4', busCount: 2,
        color: '#FFD700', speedKmh: 35,
        waypoints: [
          [19.2480, -103.7050], [19.2430, -103.7050], [19.2370, -103.7060],
          [19.2310, -103.7080], [19.2260, -103.7110], [19.2220, -103.7150],
          [19.2200, -103.7220], [19.2220, -103.7320], [19.2280, -103.7420], [19.2380, -103.7460], [19.2480, -103.7050],
        ],
      },
      {
        id: 'R5', label: 'Ruta 5', busCount: 3,
        color: '#00B4FF', speedKmh: 33,
        waypoints: [
          [19.2720, -103.7210], [19.2650, -103.7180], [19.2580, -103.7150],
          [19.2510, -103.7120], [19.2440, -103.7110], [19.2370, -103.7130],
          [19.2300, -103.7180], [19.2250, -103.7250], [19.2240, -103.7350],
          [19.2290, -103.7440], [19.2400, -103.7460], [19.2540, -103.7380], [19.2650, -103.7290], [19.2720, -103.7210],
        ],
      },
      {
        id: 'R7', label: 'Ruta 7', busCount: 4,
        color: '#FF8C00', speedKmh: 30,
        waypoints: [
          [19.2330, -103.7430], [19.2290, -103.7360], [19.2260, -103.7280],
          [19.2230, -103.7200], [19.2200, -103.7130], [19.2170, -103.7060],
          [19.2150, -103.7150], [19.2160, -103.7260], [19.2200, -103.7380],
          [19.2260, -103.7450], [19.2330, -103.7430],
        ],
      },
      {
        id: 'R9', label: 'Ruta 9', busCount: 2,
        color: '#39FF14', speedKmh: 31,
        waypoints: [
          [19.2480, -103.7050], [19.2450, -103.7100], [19.2420, -103.7160],
          [19.2390, -103.7220], [19.2360, -103.7280], [19.2330, -103.7350],
          [19.2310, -103.7430], [19.2390, -103.7470], [19.2480, -103.7050],
        ],
      },
      {
        id: 'R10', label: 'Ruta 10', busCount: 3,
        color: '#00FFD1', speedKmh: 34,
        waypoints: [
          [19.2480, -103.7050], [19.2420, -103.7055], [19.2360, -103.7065],
          [19.2300, -103.7080], [19.2250, -103.7100], [19.2210, -103.7130],
          [19.2190, -103.7210], [19.2200, -103.7310], [19.2250, -103.7400],
          [19.2350, -103.7460], [19.2460, -103.7450], [19.2480, -103.7050],
        ],
      },
      {
        id: 'R11', label: 'Ruta 11', busCount: 2,
        color: '#00B4FF', speedKmh: 29,
        waypoints: [
          [19.2600, -103.7200], [19.2540, -103.7160], [19.2470, -103.7130],
          [19.2400, -103.7120], [19.2340, -103.7150], [19.2280, -103.7200],
          [19.2240, -103.7280], [19.2260, -103.7380], [19.2350, -103.7440],
          [19.2460, -103.7430], [19.2560, -103.7370], [19.2600, -103.7200],
        ],
      },
      {
        id: 'R13', label: 'Ruta 13', busCount: 2,
        color: '#bd79f9', speedKmh: 27,
        waypoints: [
          [19.2430, -103.7460], [19.2370, -103.7400], [19.2320, -103.7330],
          [19.2290, -103.7260], [19.2270, -103.7180], [19.2260, -103.7100],
          [19.2310, -103.7060], [19.2380, -103.7070], [19.2440, -103.7110], [19.2430, -103.7460],
        ],
      },
      {
        id: 'R14', label: 'Ruta 14', busCount: 3,
        color: '#DA70D6', speedKmh: 32,
        waypoints: [
          [19.2480, -103.7050], [19.2430, -103.7065], [19.2370, -103.7080],
          [19.2310, -103.7090], [19.2260, -103.7120], [19.2220, -103.7180],
          [19.2200, -103.7260], [19.2230, -103.7360], [19.2300, -103.7440],
          [19.2400, -103.7470], [19.2480, -103.7050],
        ],
      },
      {
        id: 'R17', label: 'Ruta 17', busCount: 2,
        color: '#FF4C6A', speedKmh: 33,
        waypoints: [
          [19.2720, -103.7380], [19.2660, -103.7310], [19.2590, -103.7240],
          [19.2510, -103.7180], [19.2440, -103.7140], [19.2370, -103.7170],
          [19.2310, -103.7240], [19.2280, -103.7330], [19.2310, -103.7420],
          [19.2400, -103.7460], [19.2510, -103.7430], [19.2620, -103.7390], [19.2720, -103.7380],
        ],
      },
      {
        id: 'R20', label: 'Ruta 20', busCount: 4,
        color: '#DA70D6', speedKmh: 35,
        waypoints: [
          [19.2720, -103.7380], [19.2670, -103.7290], [19.2600, -103.7210],
          [19.2530, -103.7150], [19.2460, -103.7110], [19.2390, -103.7110],
          [19.2330, -103.7150], [19.2280, -103.7220], [19.2260, -103.7320],
          [19.2290, -103.7430], [19.2380, -103.7470], [19.2510, -103.7450],
          [19.2620, -103.7400], [19.2720, -103.7380],
        ],
      },
      {
        id: 'R29', label: 'Ruta 29 (Libramiento)', busCount: 2,
        color: '#FF4C6A', speedKmh: 38,
        waypoints: [
          [19.2330, -103.7430], [19.2200, -103.7290], [19.2220, -103.7120],
          [19.2350, -103.7010], [19.2480, -103.7050],
          [19.2350, -103.7010], [19.2220, -103.7120], [19.2200, -103.7290], [19.2330, -103.7430]
        ],
      },
      {
        id: 'RCoq', label: 'Ruta Colima-Coquimatlán', busCount: 3,
        color: '#FF5722', speedKmh: 42,
        waypoints: [
          [19.2435, -103.7260], [19.2330, -103.7430], [19.2312, -103.7682],
          [19.2119, -103.8032], [19.2013, -103.8106],
          [19.2119, -103.8032], [19.2312, -103.7682], [19.2330, -103.7430], [19.2435, -103.7260]
        ],
      },
      {
        id: 'RBuena', label: 'Ruta Colima-Buenavista', busCount: 2,
        color: '#8A2BE2', speedKmh: 40,
        waypoints: [
          [19.2435, -103.7260], [19.2480, -103.7050], [19.2480, -103.6800],
          [19.2483, -103.6500], [19.2486, -103.6152],
          [19.2483, -103.6500], [19.2480, -103.6800], [19.2480, -103.7050], [19.2435, -103.7260]
        ],
      },
      {
        id: 'RTrap', label: 'Ruta Colima-El Trapiche', busCount: 2,
        color: '#FF1493', speedKmh: 45,
        waypoints: [
          [19.2435, -103.7260], [19.2720, -103.7210], [19.2750, -103.6900],
          [19.2782, -103.6615],
          [19.2750, -103.6900], [19.2720, -103.7210], [19.2435, -103.7260]
        ],
      },
    ];

    // ═══════════════════════════════════════════════════════════
    // OSRM — traza rutas sobre calles reales
    // ═══════════════════════════════════════════════════════════
    async function getRoute(waypoints) {
      const coords = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';');
      try {
        const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
        const d = await r.json();
        if (d.routes && d.routes[0])
          return d.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      } catch (e) { }
      return waypoints;
    }

    // ═══════════════════════════════════════════════════════════
    // SIMULACIÓN
    // ═══════════════════════════════════════════════════════════
    let playing = false, speed = 5;
    let simT = 0;         // segundos simulados
    let totalPkts = 0, lostPkts = 0;
    let routeData = [];   // coordenadas reales por ruta
    let buses = [];
    let busMarkers = {};
    let logEntries = [];
    const TX_INTERVAL = 30;  // segundos LoRaWAN entre transmisiones
    const TOA_MS = 60;        // ms en el aire (SF8, 12 bytes, US915)
    let totalDistKm = 0;
    let lastDomUpdateT = 0;
    let lastRouteListUpdateT = 0;

    // Pulsos animados en SVG
    let pulses = [];

    function nearestGW(lat, lng) {
      let best = 0, bestD = Infinity;
      GWS.forEach((g, i) => {
        const d = Math.hypot(g.lat - lat, g.lng - lng);
        if (d < bestD) { bestD = d; best = i; }
      });
      return { idx: best, distM: bestD * 111000 };
    }

    // ¿Está el punto dentro del radio del GW más cercano?
    function inCoverage(lat, lng) {
      const { distM } = nearestGW(lat, lng);
      return distM <= GW_RADIUS;
    }

    // Pérdida de paquetes: base ~5%, sube con carga del canal
    function pdrLoss() {
      const load = (totalPkts * TOA_MS / 1000) / Math.max(simT, 1);
      const baseP = 0.05 + Math.min(load * 0.15, 0.20);
      return Math.random() < baseP;
    }

    function busLatLng(bus) {
      const coords = routeData[bus.routeIdx];
      if (!coords || coords.length < 2) return [19.248, -103.726];
      const n = coords.length - 1;
      const seg = Math.min(Math.floor(bus.progress * n), n - 1);
      const frac = (bus.progress * n) - seg;
      const a = coords[seg], b = coords[Math.min(seg + 1, n)];
      return [a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac];
    }

    function simTimeStr(s) {
      const h = Math.floor(s / 3600) % 24;
      const m = Math.floor(s / 60) % 60;
      const ss = Math.floor(s) % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    }

    function addLog(entry) {
      logEntries.unshift(entry);
      if (logEntries.length > 10) logEntries.pop();
      const el = document.getElementById('log');
      el.innerHTML = logEntries.map(e => `
    <div class="log-entry" style="border-color:${e.color}">
      <div class="log-head">
        <span class="log-name" style="color:${e.color}">${e.name}</span>
        <span class="log-time">${e.time}</span>
      </div>
      <div class="log-body">${e.body}</div>
    </div>
  `).join('');
    }

    function drawPulses() {
      const svg = document.getElementById('pulse-svg');
      svg.innerHTML = '';
      pulses.forEach(p => {
        const from = map.latLngToContainerPoint([p.fromLat, p.fromLng]);
        const to = map.latLngToContainerPoint([p.toLat, p.toLng]);
        const fade = p.progress < 0.1 ? p.progress / 0.1 : p.progress > 0.9 ? (1 - p.progress) / 0.1 : 1;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', from.x); line.setAttribute('y1', from.y);
        line.setAttribute('x2', to.x); line.setAttribute('y2', to.y);
        line.setAttribute('stroke', p.color);
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('stroke-opacity', 0.12 * fade);
        line.setAttribute('stroke-dasharray', '3 8');
        svg.appendChild(line);

        const cx = from.x + (to.x - from.x) * p.progress;
        const cy = from.y + (to.y - from.y) * p.progress;

        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', cx); c.setAttribute('cy', cy);
        c.setAttribute('r', p.lost ? 3 : 5);
        c.setAttribute('fill', p.lost ? '#FF4C6A' : p.color);
        c.setAttribute('opacity', fade * 0.9);
        svg.appendChild(c);

        if (!p.lost) {
          const h = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          h.setAttribute('cx', cx); h.setAttribute('cy', cy);
          h.setAttribute('r', 9);
          h.setAttribute('fill', 'none');
          h.setAttribute('stroke', p.color);
          h.setAttribute('stroke-width', '1');
          h.setAttribute('opacity', fade * 0.3);
          svg.appendChild(h);
        }
      });
    }

    function updateHeader() {
      const activeBuses = buses.filter(b => ROUTE_DEFS[b.routeIdx].active !== false);
      document.getElementById('hm-buses').textContent = activeBuses.length;
      document.getElementById('hm-pkts').textContent = totalPkts;
      document.getElementById('hm-lost').textContent = lostPkts;
      const pdr = totalPkts > 0 ? ((totalPkts - lostPkts) / totalPkts * 100).toFixed(1) + '%' : '—';
      document.getElementById('hm-pdr').textContent = pdr;
      document.getElementById('hm-simtime').textContent = simTimeStr(simT).slice(0, 5);
      document.getElementById('sim-clock').textContent = 'Reloj de simulación: ' + simTimeStr(simT);

      // Ocupación del canal (simplificada)
      const nBuses = activeBuses.length;
      const occMs = (nBuses * TOA_MS) / (TX_INTERVAL * 1000) * 100;
      document.getElementById('met-occ').textContent = occMs.toFixed(1) + '%';
      document.getElementById('met-dist').textContent = totalDistKm.toFixed(1) + ' km';

      // GW pkts
      GWS.forEach(gw => {
        const el = document.getElementById(`gw-pkts-${gw.id}`);
        if (el) el.textContent = gwPkts[gw.id];
      });
    }

    function updateRouteList() {
      const el = document.getElementById('route-list');
      const activeRoutes = ROUTE_DEFS.filter(r => r.active !== false);
      el.innerHTML = activeRoutes.map((r) => {
        const i = ROUTE_DEFS.indexOf(r);
        const busesDef = buses.filter(b => b.routeIdx === i);
        const ll = busesDef.length > 0 ? busLatLng(busesDef[0]) : null;
        const gwId = ll ? GWS[nearestGW(ll[0], ll[1]).idx].id : '—';
        return `
      <div class="route-row" onclick="flyToRoute(${i})">
        <div class="route-swatch" style="background:${r.color}"></div>
        <div class="route-info">
          <div class="route-name">${r.label}</div>
          <div class="route-detail">${r.busCount} unidades · ${r.speedKmh} km/h · ${gwId}</div>
        </div>
        <div class="route-badge" style="background:${r.color}18;color:${r.color}">TX</div>
      </div>
    `;
      }).join('');
      document.getElementById('route-count').textContent = activeRoutes.length;
    }

    function flyToRoute(idx) {
      const busList = buses.filter(b => b.routeIdx === idx);
      if (busList.length > 0) {
        const ll = busLatLng(busList[0]);
        map.flyTo(ll, 14);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // LOOP
    // ═══════════════════════════════════════════════════════════
    let lastTs = null;

    function loop(ts) {
      if (!lastTs) lastTs = ts;
      const wallDt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;

      if (playing) {
        const dt = wallDt * speed;
        simT += dt;

        buses.forEach(bus => {
          const def = ROUTE_DEFS[bus.routeIdx];
          if (def.active === false) return; // Omitir simulación para rutas desactivadas

          const coords = routeData[bus.routeIdx];
          if (!coords || coords.length < 2) return;

          // Velocidad real: progreso en función de km/h y longitud real de la ruta
          const totalLenKm = bus.routeLenKm || 8;
          const progressPerSec = (def.speedKmh / 3600) / totalLenKm;
          bus.progress += progressPerSec * dt;
          if (bus.progress >= 1) bus.progress -= 1;

          totalDistKm += (def.speedKmh / 3600) * dt / 1000;

          const ll = busLatLng(bus);
          busMarkers[bus.uid].setLatLng(ll);

          // TX periódico
          bus.txTimer += dt;
          if (bus.txTimer >= TX_INTERVAL) {
            bus.txTimer -= TX_INTERVAL;

            const inCov = inCoverage(ll[0], ll[1]);
            const lost = !inCov || pdrLoss();
            totalPkts++;
            if (lost) lostPkts++;

            const { idx: gwIdx } = nearestGW(ll[0], ll[1]);
            const gw = GWS[gwIdx];

            if (!lost) {
              gwPkts[gw.id]++;
              pulses.push({
                fromLat: ll[0], fromLng: ll[1],
                toLat: gw.lat, toLng: gw.lng,
                color: def.color, progress: 0, lost: false,
              });
            } else {
              pulses.push({
                fromLat: ll[0], fromLng: ll[1],
                toLat: ll[0] + 0.005, toLng: ll[1] + 0.005,
                color: '#FF4C6A', progress: 0, lost: true,
              });
            }

            addLog({
              name: def.label,
              color: def.color,
              time: simTimeStr(simT).slice(0, 5),
              body: lost
                ? `✗ Paquete perdido — ${inCov ? 'colisión/ruido' : 'sin cobertura'}`
                : `✓ → ${gw.id} · ${gw.name}`,
            });
          }
        });

        pulses.forEach(p => { p.progress += wallDt * 1.2; });
        pulses = pulses.filter(p => p.progress < 1);

        // Optimización: Reducir actualizaciones del DOM para evitar sobrecarga de CPU (Reflow/Layout)
        if (simT - lastDomUpdateT >= 0.2) {
          updateHeader();
          lastDomUpdateT = simT;
        }
        if (simT - lastRouteListUpdateT >= 1.0) {
          updateRouteList();
          lastRouteListUpdateT = simT;
        }
      }

      drawPulses();
      requestAnimationFrame(loop);
    }

    // ═══════════════════════════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════════════════════════
    async function init() {
      const lbar = document.getElementById('lbar');
      const lstatus = document.getElementById('lstatus');
      const total = ROUTE_DEFS.length;

      for (let i = 0; i < total; i++) {
        const def = ROUTE_DEFS[i];
        lstatus.textContent = `Trazando ${def.label} sobre calles reales...`;
        lbar.style.width = `${Math.round((i / total) * 90)}%`;

        const coords = await getRoute(def.waypoints);
        routeData.push(coords);

        // Calcular longitud aproximada de la ruta
        let lenM = 0;
        for (let j = 1; j < coords.length; j++) {
          lenM += map.distance(coords[j - 1], coords[j]);
        }
        const lenKm = lenM / 1000;

        // Dibujar ruta
        const polylineLayer = L.polyline(coords, { color: def.color, weight: 2.5, opacity: 0.65, lineJoin: 'round' })
          .addTo(map)
          .bindTooltip(`${def.label} · ${def.speedKmh} km/h · ${lenKm.toFixed(1)} km`, { sticky: true });
        def.polylineLayer = polylineLayer;

        // Crear camiones
        for (let b = 0; b < def.busCount; b++) {
          const uid = `${def.id}_${b}`;
          const progress = b / def.busCount;
          const coordIdx = Math.min(Math.floor(progress * coords.length), coords.length - 1);

          const busIcon = L.divIcon({
            className: '',
            html: `<div style="
          width:24px;height:24px;border-radius:50%;
          background:${def.color};border:2px solid rgba(7,9,15,0.8);
          display:flex;align-items:center;justify-content:center;
          font-family:'Orbitron',sans-serif;font-size:7px;font-weight:700;
          color:rgba(7,9,15,0.9);
          box-shadow:0 2px 8px rgba(0,0,0,0.7);
        ">${def.id.replace('R', '')}</div>`,
            iconSize: [24, 24], iconAnchor: [12, 12],
          });

          busMarkers[uid] = L.marker(coords[coordIdx], { icon: busIcon, zIndexOffset: 1000 })
            .addTo(map)
            .bindTooltip(`${def.label} · unidad ${b + 1} · ${def.speedKmh} km/h`, { direction: 'top', offset: [0, -16] });

          buses.push({
            uid, routeIdx: i, busNum: b + 1,
            progress,
            routeLenKm: lenKm,
            txTimer: Math.random() * TX_INTERVAL,
          });
        }
      }

      setTimeout(() => {
        lbar.style.width = '100%';
        lstatus.textContent = `${buses.length} camiones en ${total} rutas — sistema listo`;
        document.getElementById('loading').style.display = 'none';
        playing = true;
        requestAnimationFrame(loop);
      }, 700);
    }

    init();

    // ═══════════════════════════════════════════════════════════
    // CONTROLES
    // ═══════════════════════════════════════════════════════════
    function toggleSidebar() {
      const sidebar = document.getElementById('sidebar');
      const toggleBtn = document.getElementById('sidebar-toggle');
      const isOpen = sidebar.classList.toggle('open');
      if (toggleBtn) {
        toggleBtn.innerHTML = isOpen ? '✕ Cerrar Panel' : '📊 Ver Controles';
        if (isOpen) {
          toggleBtn.classList.add('active');
        } else {
          toggleBtn.classList.remove('active');
        }
      }
    }

    function togglePlay() {
      playing = !playing;
      const btn = document.getElementById('btn-play');
      btn.textContent = playing ? '⏸ PAUSAR' : '▶ REANUDAR';
      btn.className = playing ? 'active' : '';
    }

    function resetSim() {
      simT = 0; totalPkts = 0; lostPkts = 0; totalDistKm = 0;
      lastDomUpdateT = 0; lastRouteListUpdateT = 0;
      pulses = []; logEntries = [];
      GWS.forEach(gw => gwPkts[gw.id] = 0);
      buses.forEach((b, i) => {
        b.progress = (b.busNum - 1) / ROUTE_DEFS[b.routeIdx].busCount;
        b.txTimer = Math.random() * TX_INTERVAL;
      });
      document.getElementById('log').innerHTML = '';
      updateHeader();
    }

    function setSpeed(v) { speed = parseFloat(v); }

    function toggleForaneas(enabled) {
      const targetIds = ['RCoq', 'RBuena', 'RTrap'];
      targetIds.forEach(id => {
        const def = ROUTE_DEFS.find(r => r.id === id);
        if (!def) return;

        def.active = enabled;

        // Mostrar/ocultar línea de ruta en el mapa
        if (def.polylineLayer) {
          if (enabled) {
            def.polylineLayer.addTo(map);
          } else {
            map.removeLayer(def.polylineLayer);
          }
        }

        // Mostrar/ocultar marcadores de autobuses
        buses.forEach(bus => {
          if (bus.routeIdx === ROUTE_DEFS.indexOf(def)) {
            const marker = busMarkers[bus.uid];
            if (marker) {
              if (enabled) {
                marker.addTo(map);
              } else {
                map.removeLayer(marker);
              }
            }
          }
        });

        // Limpiar pulsos de la ruta desactivada
        if (!enabled) {
          pulses = pulses.filter(p => p.color !== def.color);
        }
      });

      // Actualizar DOM de inmediato
      updateHeader();
      updateRouteList();
    }

    map.on('move zoom', drawPulses);
