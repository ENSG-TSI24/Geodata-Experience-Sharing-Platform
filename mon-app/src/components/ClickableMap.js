
import { useMapEvents } from "react-leaflet"; // Import useMapEvents

function ClickableMap({ addMarker }) {
  useMapEvents({
    click(e) {
      addMarker(e.latlng);
    },
  });

  return null;
}

export default ClickableMap;