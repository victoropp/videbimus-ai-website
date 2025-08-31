'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, Building2, MapPin, Calendar, DollarSign, Percent, Mail, Link, Phone, Hash } from 'lucide-react';

interface Entity {
  text: string;
  type: 'PERSON' | 'ORG' | 'GPE' | 'DATE' | 'MONEY' | 'PERCENT' | 'EMAIL' | 'URL' | 'PHONE';
  confidence: number;
  startIndex: number;
  endIndex: number;
}

const entityIcons = {
  PERSON: User,
  ORG: Building2,
  GPE: MapPin,
  DATE: Calendar,
  MONEY: DollarSign,
  PERCENT: Percent,
  EMAIL: Mail,
  URL: Link,
  PHONE: Phone,
};

const entityColors = {
  PERSON: 'bg-blue-100 text-blue-800 border-blue-200',
  ORG: 'bg-purple-100 text-purple-800 border-purple-200',
  GPE: 'bg-green-100 text-green-800 border-green-200',
  DATE: 'bg-orange-100 text-orange-800 border-orange-200',
  MONEY: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PERCENT: 'bg-pink-100 text-pink-800 border-pink-200',
  EMAIL: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  URL: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  PHONE: 'bg-teal-100 text-teal-800 border-teal-200',
};

const entityDescriptions = {
  PERSON: 'Person',
  ORG: 'Organization',
  GPE: 'Location',
  DATE: 'Date',
  MONEY: 'Money',
  PERCENT: 'Percentage',
  EMAIL: 'Email',
  URL: 'URL',
  PHONE: 'Phone',
};

export function NERDemo() {
  const [text, setText] = useState('');
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedText, setHighlightedText] = useState<React.ReactNode[]>([]);

  const sampleTexts = [
    "John Smith, CEO of Microsoft, announced a $5 billion investment in Seattle on January 15, 2024. Contact him at john.smith@microsoft.com or call +1-425-555-0100.",
    "Apple Inc. reported a 15% increase in revenue last quarter. Tim Cook will present at the conference in San Francisco next week. Visit https://apple.com for more information.",
    "Dr. Sarah Johnson from Harvard University published her research on climate change. The study shows a 2.5°C temperature increase by 2050. Email: sjohnson@harvard.edu",
    "Amazon's Jeff Bezos met with President Biden in Washington D.C. to discuss the $10 billion climate fund. The meeting took place on March 20th at the White House.",
  ];

  const extractEntities = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/demos/entities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Entity extraction failed');
      }

      const data = await response.json();
      setEntities(data.entities || []);
      highlightEntitiesInText(text, data.entities || []);
    } catch (error) {
      console.error('Entity extraction error:', error);
      setEntities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const highlightEntitiesInText = (originalText: string, extractedEntities: Entity[]) => {
    if (!extractedEntities.length) {
      setHighlightedText([originalText]);
      return;
    }

    // Sort entities by start index
    const sortedEntities = [...extractedEntities].sort((a, b) => a.startIndex - b.startIndex);
    
    const highlighted: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedEntities.forEach((entity, idx) => {
      // Add text before entity
      if (entity.startIndex > lastIndex) {
        highlighted.push(
          <span key={`text-${idx}`}>
            {originalText.substring(lastIndex, entity.startIndex)}
          </span>
        );
      }

      // Add highlighted entity
      const Icon = entityIcons[entity.type];
      highlighted.push(
        <span
          key={`entity-${idx}`}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${entityColors[entity.type]} font-medium`}
          title={`${entityDescriptions[entity.type]} (${(entity.confidence * 100).toFixed(0)}% confidence)`}
        >
          <Icon className="w-3 h-3" />
          {entity.text}
        </span>
      );

      lastIndex = entity.endIndex;
    });

    // Add remaining text
    if (lastIndex < originalText.length) {
      highlighted.push(
        <span key="text-final">
          {originalText.substring(lastIndex)}
        </span>
      );
    }

    setHighlightedText(highlighted);
  };

  // Group entities by type
  const groupedEntities = entities.reduce((acc, entity) => {
    if (!acc[entity.type]) {
      acc[entity.type] = [];
    }
    acc[entity.type].push(entity);
    return acc;
  }, {} as Record<string, Entity[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Hash className="w-5 h-5 text-indigo-500" />
            <span>Named Entity Recognition (NER) Demo</span>
            <Badge variant="outline" className="ml-2">Powered by BERT</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Enter text to extract entities:
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text containing names, organizations, locations, dates, emails, etc..."
              rows={4}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Or try one of these examples:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {sampleTexts.map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setText(sample)}
                  className="text-left h-auto p-3 text-xs whitespace-normal"
                >
                  {sample}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={extractEntities}
            disabled={!text.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? 'Extracting Entities...' : 'Extract Entities'}
          </Button>
        </CardContent>
      </Card>

      {entities.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Highlighted Text</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/30 rounded-lg leading-relaxed">
                {highlightedText}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Extracted Entities ({entities.length} found)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(groupedEntities).map(([type, typeEntities]) => {
                const Icon = entityIcons[type as Entity['type']];
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-5 h-5" />
                      <h3 className="font-semibold">{entityDescriptions[type as Entity['type']]}</h3>
                      <Badge variant="secondary">{typeEntities.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {typeEntities.map((entity, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border ${entityColors[type as Entity['type']]}`}
                        >
                          <div className="font-medium">{entity.text}</div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs opacity-75">
                              Position: {entity.startIndex}-{entity.endIndex}
                            </span>
                            <div className="flex items-center gap-1">
                              <Progress 
                                value={entity.confidence * 100} 
                                className="w-12 h-2"
                              />
                              <span className="text-xs font-medium">
                                {(entity.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-medium mb-2">Entity Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(groupedEntities).map(([type, typeEntities]) => {
                    const Icon = entityIcons[type as Entity['type']];
                    const avgConfidence = typeEntities.reduce((sum, e) => sum + e.confidence, 0) / typeEntities.length;
                    return (
                      <div key={type} className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{typeEntities.length} {entityDescriptions[type as Entity['type']]}</div>
                          <div className="text-xs text-muted-foreground">
                            {(avgConfidence * 100).toFixed(0)}% avg confidence
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}