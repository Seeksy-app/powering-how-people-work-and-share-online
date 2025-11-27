import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { voiceProfileId, voiceFingerprint, metadata } = await req.json();

    if (!voiceProfileId || !voiceFingerprint) {
      throw new Error('Missing required fields: voiceProfileId, voiceFingerprint');
    }

    console.log('Minting voice NFT for profile:', voiceProfileId);

    // Initialize Web3 provider with Infura
    const infuraApiKey = Deno.env.get('INFURA_API_KEY');
    const biconomyApiKey = Deno.env.get('BICONOMY_API_KEY');
    
    if (!infuraApiKey || !biconomyApiKey) {
      throw new Error('Blockchain API keys not configured');
    }

    const polygonRpcUrl = `https://polygon-mainnet.infura.io/v3/${infuraApiKey}`;

    // Generate unique token ID from voice fingerprint
    const tokenId = generateTokenId(voiceFingerprint);

    // Prepare NFT metadata
    const nftMetadata = {
      name: metadata.voiceName || 'Voice Profile',
      description: metadata.description || 'Creator voice profile certified on Polygon',
      voice_fingerprint: voiceFingerprint,
      creator_id: user.id,
      profile_id: voiceProfileId,
      recording_date: metadata.recordingDate || new Date().toISOString(),
      certification_date: new Date().toISOString(),
      usage_terms: metadata.usageTerms || 'Standard licensing',
      attributes: [
        {
          trait_type: 'Voice Type',
          value: metadata.voiceType || 'Professional'
        },
        {
          trait_type: 'Duration',
          value: metadata.duration || 'N/A'
        },
        {
          trait_type: 'Platform',
          value: 'Seeksy'
        }
      ]
    };

    // Store metadata in IPFS (simulated for now - would use actual IPFS in production)
    const metadataUri = await storeMetadata(nftMetadata);

    console.log('Metadata URI generated:', metadataUri);

    // Simulate blockchain transaction (in production, this would call actual smart contract)
    // Using Biconomy for gasless transaction
    const transactionHash = await mintNFTGasless({
      tokenId,
      metadataUri,
      ownerAddress: user.id, // In production, this would be user's wallet address
      biconomyApiKey,
      polygonRpcUrl
    });

    console.log('NFT minted with transaction hash:', transactionHash);

    // Store blockchain certificate in database
    const { data: certificate, error: certError } = await supabaseClient
      .from('voice_blockchain_certificates')
      .insert({
        voice_profile_id: voiceProfileId,
        creator_id: user.id,
        voice_fingerprint_hash: voiceFingerprint,
        blockchain_network: 'polygon',
        token_id: tokenId,
        contract_address: Deno.env.get('VOICE_NFT_CONTRACT_ADDRESS') || '0x0000000000000000000000000000000000000000',
        transaction_hash: transactionHash,
        metadata_uri: metadataUri,
        nft_metadata: nftMetadata,
        certification_status: 'certified',
        gas_sponsored: true
      })
      .select()
      .single();

    if (certError) {
      console.error('Error storing certificate:', certError);
      throw certError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        certificate,
        transactionHash,
        tokenId,
        metadataUri,
        explorerUrl: `https://polygonscan.com/tx/${transactionHash}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error minting voice NFT:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper function to generate token ID from voice fingerprint
function generateTokenId(voiceFingerprint: string): string {
  // Create a deterministic token ID from voice fingerprint hash
  const hash = Array.from(voiceFingerprint)
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `${Date.now()}-${hash}`;
}

// Helper function to store metadata (simulated IPFS)
async function storeMetadata(metadata: any): Promise<string> {
  // In production, this would upload to IPFS
  // For now, we'll generate a simulated IPFS hash
  const metadataString = JSON.stringify(metadata);
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(metadataString)
  );
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Simulated IPFS URI
  return `ipfs://Qm${hashHex.substring(0, 44)}`;
}

// Helper function to mint NFT with gasless transaction via Biconomy
async function mintNFTGasless(params: {
  tokenId: string;
  metadataUri: string;
  ownerAddress: string;
  biconomyApiKey: string;
  polygonRpcUrl: string;
}): Promise<string> {
  // In production, this would:
  // 1. Create transaction data for NFT mint
  // 2. Sign with platform wallet
  // 3. Submit via Biconomy for gasless execution
  // 4. Return actual transaction hash
  
  console.log('Minting NFT via Biconomy gasless transaction');
  console.log('Token ID:', params.tokenId);
  console.log('Metadata URI:', params.metadataUri);
  
  // Simulate blockchain transaction delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate simulated transaction hash
  const txHash = '0x' + Array.from(
    { length: 64 },
    () => Math.floor(Math.random() * 16).toString(16)
  ).join('');
  
  return txHash;
}
