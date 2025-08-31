import { NextRequest, NextResponse } from 'next/server';
import { dynamicConfig, getEnabledProviders, getAvailableModels } from '@/lib/ai/dynamic-config';
import { AIProviderFactory } from '@/lib/ai/provider-factory';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Get current configuration
    const enabledProviders = getEnabledProviders();
    const availableModels = getAvailableModels();
    
    // Test providers if requested
    const testProviders = request.nextUrl.searchParams.get('test') === 'true';
    let providerTests = {};
    
    if (testProviders) {
      providerTests = await AIProviderFactory.testAllProviders();
    }
    
    // Get Hugging Face specific info
    const hfConfig = dynamicConfig.getProviderConfig('huggingface');
    const hfToken = hfConfig?.apiKey;
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      configuration: {
        totalProviders: 8,
        enabledProviders: enabledProviders.length,
        providers: enabledProviders.map(p => ({
          name: p.name,
          enabled: p.enabled,
          modelsAvailable: p.models?.length || 0,
          apiKeyConfigured: !!p.apiKey,
          apiKeyPrefix: p.apiKey ? p.apiKey.substring(0, 10) + '...' : null,
        })),
      },
      huggingface: {
        enabled: hfConfig?.enabled || false,
        tokenConfigured: !!hfToken,
        tokenSource: hfToken ? (
          hfToken === dynamicConfig.get('NEXT_PUBLIC_HUGGINGFACE_API_KEY') 
            ? 'NEXT_PUBLIC_HUGGINGFACE_API_KEY' 
            : 'HUGGINGFACE_API_KEY'
        ) : null,
        tokenPrefix: hfToken ? hfToken.substring(0, 10) + '...' : null,
        models: hfConfig?.models || [],
      },
      models: {
        total: availableModels.length,
        byProvider: availableModels.reduce((acc, model) => {
          if (!acc[model.provider]) {
            acc[model.provider] = [];
          }
          acc[model.provider].push(model.model);
          return acc;
        }, {} as Record<string, string[]>),
      },
      tests: testProviders ? providerTests : 'Add ?test=true to test provider connections',
      dynamicReload: {
        enabled: true,
        checkInterval: '5 seconds',
        lastCheck: new Date().toISOString(),
        message: 'Configuration automatically reloads from .env.local every 5 seconds',
      },
    });
  } catch (error) {
    console.error('Error checking AI provider status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}