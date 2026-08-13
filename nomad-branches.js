/* Nomad AI — chain branches.
   =====================================================================
   Two of the places the Telegram bot's database carries are chains, and
   the bot listed every branch inside the `addr` field as one blob of
   Russian free text:

     "Сеть кофеен, филиалы:\n• Уметалиева 74\n• Боконбаева 103 …"

   The app rendered that as a single squashed line and put one pin on the
   map, so eight or nine real locations were invisible. The addresses are
   parsed out here and carry a coordinate each, so every branch gets a pin
   and the place screen can list them.

   `geo` records how well each address resolved through OpenStreetMap's
   Nominatim geocoder, because it varies and the app says so:

     nominatim         matched a building — the pin is the branch
     nominatim-approx  matched the street only, so the pin is somewhere on
                       the right road rather than on the doorstep. The
                       written address is still exact; only the dot is soft.

   Geocoded once, offline, rather than at run time: the addresses do not
   change, and Nominatim is not a service to call on every page load.
*/
window.NOMAD_BRANCHES = {

  // Bublik — coffee & bakery chain
  1020: {
    chain: 'Bublik',
    note: 'Сеть кофеен',
    branches: [
      { addr: 'Уметалиева 74',       lat: 42.874616, lng: 74.580802, geo: 'nominatim' },
      { addr: 'Боконбаева 103',      lat: 42.867141, lng: 74.607798, geo: 'nominatim' },
      { addr: 'Тоголок Молдо 5/1',   lat: 42.872890, lng: 74.595969, geo: 'nominatim' },
      { addr: 'Токтогула 75/1',      lat: 42.871887, lng: 74.614818, geo: 'nominatim' },
      // Nominatim returned the Bublik shopfront itself for this one.
      { addr: 'Токтогула 234',       lat: 42.873153, lng: 74.577766, geo: 'nominatim' },
      { addr: '10-й мкр, 33',        lat: 42.829383, lng: 74.606788, geo: 'nominatim' },
      { addr: 'Тыналиева 3/14',      lat: 42.815152, lng: 74.543979, geo: 'nominatim-approx' },
      { addr: '7-й мкр, 33/3',       lat: 42.824194, lng: 74.615531, geo: 'nominatim-approx' },
      { addr: 'Сухэ-Батора 21',      lat: 42.826262, lng: 74.692561, geo: 'nominatim-approx' }
    ]
  },

  // Mubarak — chaikhana chain
  1022: {
    chain: 'Mubarak',
    note: 'Сеть чайхан',
    branches: [
      { addr: 'БЦ Гоголь (Гоголя 28)', lat: 42.872945, lng: 74.619827, geo: 'nominatim' },
      { addr: 'Чуй 104',               lat: 42.875585, lng: 74.546580, geo: 'nominatim' },
      { addr: 'М. Горького 148',       lat: 42.909033, lng: 74.633169, geo: 'nominatim' },
      { addr: 'Айтматова 299/7а',      lat: 42.828647, lng: 74.584342, geo: 'nominatim' },
      { addr: 'Тыныстанова 94',        lat: 42.841214, lng: 74.603965, geo: 'nominatim-approx' },
      { addr: 'Сухэ-Батора 5/3',       lat: 42.826262, lng: 74.692561, geo: 'nominatim-approx' },
      { addr: 'Киевская 206',          lat: 42.874290, lng: 74.614498, geo: 'nominatim-approx' },
      { addr: 'Тыналиева 116',         lat: 42.815152, lng: 74.543979, geo: 'nominatim-approx' }
    ]
  }
};
