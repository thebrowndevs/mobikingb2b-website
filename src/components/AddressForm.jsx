"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  addAddressApi,
  updateAddressApi,
} from "@/lib/services/operations/AddressApi";
import { Search, Compass, MapPin } from "lucide-react";

const LABEL_TYPES = [
  { value: "home", label: "Home", emoji: "🏠" },
  { value: "work", label: "Work", emoji: "💼" },
  { value: "other", label: "Other", emoji: "📍" },
];

export default function AddressForm({
  isOpen,
  onClose,
  onAddressChange,
  addressToEdit = null,
}) {
  const { accessToken } = useAuth();
  const isEditMode = Boolean(addressToEdit);

  const [form, setForm] = useState({
    street: "",
    city: "",
    state: "",
    pinCode: "",
    label: "home",
    latitude: 28.5355,
    longitude: 77.3910,
  });
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const isSelectingRef = useRef(false);
  const formRef = useRef(form);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  // Initialize form state
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && addressToEdit) {
        setForm({
          street: addressToEdit.street || "",
          city: addressToEdit.city || "",
          state: addressToEdit.state || "",
          pinCode: addressToEdit.pinCode || "",
          label: addressToEdit.label || "home",
          latitude: addressToEdit.latitude || 28.5355,
          longitude: addressToEdit.longitude || 77.3910,
        });
      } else {
        setForm({
          street: "",
          city: "",
          state: "",
          pinCode: "",
          label: "home",
          latitude: 28.5355,
          longitude: 77.3910,
        });
      }
      setSearchInput("");
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [isOpen, addressToEdit, isEditMode]);

  // Sync state coordinates to map and marker if changed externally
  useEffect(() => {
    if (mapRef.current && markerRef.current && form.latitude && form.longitude) {
      const markerLatLng = markerRef.current.getLatLng();
      if (
        Math.abs(markerLatLng.lat - form.latitude) > 0.0001 ||
        Math.abs(markerLatLng.lng - form.longitude) > 0.0001
      ) {
        mapRef.current.setView([form.latitude, form.longitude], 15);
        markerRef.current.setLatLng([form.latitude, form.longitude]);
      }
    }
  }, [form.latitude, form.longitude]);

  // Reverse geocoding to fill form fields
  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lon}`
      );
      const result = await response.json();
      if (result && result.address) {
        const addr = result.address;
        const streetParts = [
          addr.house_number,
          addr.building,
          addr.road,
          addr.suburb,
          addr.neighbourhood,
        ].filter(Boolean);

        const street = streetParts.join(", ") || result.display_name.split(",")[0] || "";
        const city = addr.city || addr.town || addr.municipality || addr.district || addr.county || "";
        const state = addr.state || "";
        const pinCode = addr.postcode || "";

        setForm((prev) => ({
          ...prev,
          street,
          city,
          state,
          pinCode: pinCode.replace(/\s/g, "").slice(0, 6),
          latitude: lat,
          longitude: lon,
        }));

        isSelectingRef.current = true;
        setSearchInput(result.display_name);
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
    }
  };

  // Auto-fetch location for new address
  useEffect(() => {
    if (isOpen && !isEditMode) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const parsedLat = parseFloat(latitude.toFixed(6));
            const parsedLng = parseFloat(longitude.toFixed(6));
            setForm((prev) => ({
              ...prev,
              latitude: parsedLat,
              longitude: parsedLng,
            }));
            reverseGeocode(parsedLat, parsedLng);
          },
          (error) => {
            console.log("Auto-location failed:", error);
          }
        );
      }
    }
  }, [isOpen, isEditMode]);

  // Debounced search / autocomplete query
  useEffect(() => {
    if (searchInput.length < 3) {
      setSuggestions([]);
      return;
    }

    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=in&q=${encodeURIComponent(
            searchInput
          )}`
        );
        const data = await response.json();
        setSuggestions(data || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Autocomplete fetch failed:", err);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  // Handle selected suggestion from dropdown
  const handleSelectSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);

    const addr = item.address || {};
    const streetParts = [
      addr.house_number,
      addr.building,
      addr.road,
      addr.suburb,
      addr.neighbourhood,
    ].filter(Boolean);

    const street = streetParts.join(", ") || item.display_name.split(",")[0] || "";
    const city = addr.city || addr.town || addr.municipality || addr.district || addr.county || "";
    const state = addr.state || "";
    const pinCode = addr.postcode || "";

    setForm((prev) => ({
      ...prev,
      street,
      city,
      state,
      pinCode: pinCode.replace(/\s/g, "").slice(0, 6),
      latitude: lat,
      longitude: lon,
    }));

    isSelectingRef.current = true;
    setSearchInput(item.display_name);
    setSuggestions([]);
    setShowDropdown(false);
    toast.success("Address details auto-filled!");
  };

  // Locate current position manually
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const parsedLat = parseFloat(latitude.toFixed(6));
        const parsedLng = parseFloat(longitude.toFixed(6));
        setForm((prev) => ({
          ...prev,
          latitude: parsedLat,
          longitude: parsedLng,
        }));
        reverseGeocode(parsedLat, parsedLng);
        toast.success("Location set and details updated!");
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Unable to retrieve location. Check permissions.");
      }
    );
  };

  // Map script loader
  useEffect(() => {
    if (isOpen) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        const mapContainer = document.getElementById("leaflet-map");
        if (mapContainer && window.L) {
          const initialLat = formRef.current.latitude || 28.5355;
          const initialLng = formRef.current.longitude || 77.3910;

          const map = window.L.map("leaflet-map").setView([initialLat, initialLng], 13);
          mapRef.current = map;

          window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
          }).addTo(map);

          const marker = window.L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
          markerRef.current = marker;

          // Drag Listener - fetch details when marker is dropped
          marker.on("dragend", () => {
            const position = marker.getLatLng();
            const lat = parseFloat(position.lat.toFixed(6));
            const lon = parseFloat(position.lng.toFixed(6));
            reverseGeocode(lat, lon);
          });

          // Click Listener - fetch details on click
          map.on("click", (e) => {
            const lat = parseFloat(e.latlng.lat.toFixed(6));
            const lon = parseFloat(e.latlng.lng.toFixed(6));
            marker.setLatLng(e.latlng);
            reverseGeocode(lat, lon);
          });
        }
      };
      document.body.appendChild(script);

      return () => {
        if (document.head.contains(link)) document.head.removeChild(link);
        if (document.body.contains(script)) document.body.removeChild(script);
        mapRef.current = null;
        markerRef.current = null;
      };
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleLabelChange = (label) => {
    setForm({ ...form, label });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accessToken) return toast.error("You must be logged in.");

    setLoading(true);
    try {
      if (isEditMode) {
        const payload = { ...form, addressId: addressToEdit._id };
        await updateAddressApi(payload, accessToken);
      } else {
        await addAddressApi(form, accessToken);
      }

      toast.success(
        `Address ${isEditMode ? "updated" : "added"} successfully!`
      );

      if (onAddressChange) {
        onAddressChange();
      }
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowDropdown(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Warehouse" : "Add New Warehouse"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-2">
            {LABEL_TYPES.map((l) => (
              <Button
                key={l.value}
                type="button"
                variant={form.label === l.value ? "default" : "outline"}
                onClick={() => handleLabelChange(l.value)}
                className="flex items-center gap-1"
              >
                <span>{l.emoji}</span> {l.label}
              </Button>
            ))}
          </div>

          <div>
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={form.street}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={form.state}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="pinCode">Pin Code</Label>
            <Input
              id="pinCode"
              value={form.pinCode}
              onChange={handleChange}
              required
              maxLength={6}
            />
          </div>

          {/* Interactive Map & Geolocation Controls */}
          <div className="space-y-3 border-t pt-4 relative">
            <Label className="font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-500" />
              Pin Delivery Location (For Hyperlocal Delivery)
            </Label>

            {/* Geolocation Autocomplete Search */}
            <div className="relative">
              <div className="flex gap-2">
                <Input
                  placeholder="Search street, area or landmarks..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowDropdown(true);
                  }}
                  className="flex-1 text-sm"
                />
                <Button
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestions[0])}
                  disabled={suggestions.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center p-2.5 h-10 w-12"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Suggestions Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-[999] text-sm divide-y divide-gray-100">
                  {suggestions.map((item, index) => (
                    <li
                      key={item.place_id || index}
                      onClick={() => handleSelectSuggestion(item)}
                      className="px-4 py-2.5 hover:bg-blue-50/50 cursor-pointer text-gray-700 transition-colors"
                    >
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Current Location Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGetCurrentLocation}
              className="w-full flex items-center justify-center gap-2 border border-blue-200 text-blue-600 hover:bg-blue-50/50 hover:border-blue-300 transition-colors py-2 text-sm font-medium"
            >
              <Compass className="h-4 w-4" /> Use Current Location
            </Button>

            {/* Leaflet Map Target */}
            <div id="leaflet-map" className="w-full h-48 rounded border relative z-10 shadow-inner"></div>

            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mt-1 bg-gray-50 p-2.5 rounded border border-gray-100">
              <div>Latitude: <span className="font-semibold text-gray-700">{form.latitude}</span></div>
              <div>Longitude: <span className="font-semibold text-gray-700">{form.longitude}</span></div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white px-6">
              {loading ? "Saving..." : isEditMode ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
