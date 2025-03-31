import { useMapEvents } from "react-leaflet"

function ClickableMap({ addMarker }) {
  useMapEvents({
    click: (e) => {
      addMarker(e.latlng)
    },
  })

  return null
}

export default ClickableMap

