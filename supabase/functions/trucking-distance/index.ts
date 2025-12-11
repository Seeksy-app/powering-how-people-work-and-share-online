import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pickup, delivery } = await req.json();

    if (!pickup?.city || !pickup?.state || !delivery?.city || !delivery?.state) {
      return new Response(
        JSON.stringify({ error: 'Missing required address fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build address strings
    const pickupAddress = `${pickup.city}, ${pickup.state}${pickup.zip ? ' ' + pickup.zip : ''}`;
    const deliveryAddress = `${delivery.city}, ${delivery.state}${delivery.zip ? ' ' + delivery.zip : ''}`;

    console.log(`Calculating distance from "${pickupAddress}" to "${deliveryAddress}"`);

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!rapidApiKey) {
      console.error('RAPIDAPI_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'distance_lookup_failed', message: 'API key not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use TrueWay Directions API via RapidAPI for driving distance
    // First, geocode both addresses
    const geocodeUrl = 'https://trueway-geocoding.p.rapidapi.com/Geocode';
    
    const [pickupGeo, deliveryGeo] = await Promise.all([
      fetch(`${geocodeUrl}?address=${encodeURIComponent(pickupAddress)}&language=en`, {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'trueway-geocoding.p.rapidapi.com'
        }
      }),
      fetch(`${geocodeUrl}?address=${encodeURIComponent(deliveryAddress)}&language=en`, {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'trueway-geocoding.p.rapidapi.com'
        }
      })
    ]);

    if (!pickupGeo.ok || !deliveryGeo.ok) {
      console.error('Geocoding failed', { pickupStatus: pickupGeo.status, deliveryStatus: deliveryGeo.status });
      return new Response(
        JSON.stringify({ error: 'distance_lookup_failed', message: 'Geocoding failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pickupData = await pickupGeo.json();
    const deliveryData = await deliveryGeo.json();

    if (!pickupData.results?.[0]?.location || !deliveryData.results?.[0]?.location) {
      console.error('No geocoding results', { pickup: pickupData, delivery: deliveryData });
      return new Response(
        JSON.stringify({ error: 'distance_lookup_failed', message: 'Could not geocode addresses' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pickupLoc = pickupData.results[0].location;
    const deliveryLoc = deliveryData.results[0].location;

    // Now get driving distance
    const directionsUrl = `https://trueway-directions2.p.rapidapi.com/FindDrivingRoute?origin=${pickupLoc.lat},${pickupLoc.lng}&destination=${deliveryLoc.lat},${deliveryLoc.lng}`;
    
    const directionsRes = await fetch(directionsUrl, {
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'trueway-directions2.p.rapidapi.com'
      }
    });

    if (!directionsRes.ok) {
      console.error('Directions API failed', { status: directionsRes.status });
      return new Response(
        JSON.stringify({ error: 'distance_lookup_failed', message: 'Directions lookup failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const directionsData = await directionsRes.json();
    
    if (!directionsData.route?.distance) {
      console.error('No route found', directionsData);
      return new Response(
        JSON.stringify({ error: 'distance_lookup_failed', message: 'No route found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Distance is in meters, convert to miles
    const distanceMeters = directionsData.route.distance;
    const distanceMiles = distanceMeters / 1609.344;

    console.log(`Distance calculated: ${distanceMiles.toFixed(1)} miles`);

    return new Response(
      JSON.stringify({ distance_miles: Math.round(distanceMiles) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error calculating distance:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'distance_lookup_failed', message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
