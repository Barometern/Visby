import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BarChart3, Copy, Edit, MapPinned, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useGameState, type LocationData } from '@/lib/game-state';
import { t, type Language } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';

const ADMIN_ENABLED = import.meta.env.DEV || import.meta.env.VITE_ENABLE_ADMIN === 'true';

export default function AdminPage() {
  const { language, isLoggedIn, isAdmin, locations, updateLocation, addLocation, removeLocation } = useGameState();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLang, setEditLang] = useState<Language>('en');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [draftLocation, setDraftLocation] = useState<LocationData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LocationData | null>(null);
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');

  const editingLoc = locations.find((location) => location.id === editingId);
  const totalScans = useMemo(
    () => locations.reduce((sum, location) => sum + location.scanCount, 0),
    [locations],
  );
  const mostScanned = useMemo(
    () => [...locations].sort((a, b) => b.scanCount - a.scanCount)[0] ?? null,
    [locations],
  );

  useEffect(() => {
    if (editingLoc) {
      setDraftLocation(editingLoc);
      setLatInput(String(editingLoc.coordinates.lat));
      setLngInput(String(editingLoc.coordinates.lng));
    } else {
      setDraftLocation(null);
      setLatInput('');
      setLngInput('');
    }
  }, [editingLoc]);

  if (!ADMIN_ENABLED) return <Navigate to="/" replace />;
  if (!isLoggedIn || !isAdmin) return <Navigate to="/login" replace />;

  const updateDraft = (updater: (current: LocationData) => LocationData) => {
    setDraftLocation((current) => (current ? updater(current) : current));
  };

  const handleAddLocation = async () => {
    const id = `loc-${Date.now()}`;
    const newLoc: LocationData = {
      id,
      qrCode: `visby-quest-${locations.length + 1}`,
      name: { en: 'New Location', sv: 'Ny Plats', de: 'Neuer Standort' },
      description: { en: 'Description...', sv: 'Beskrivning...', de: 'Beschreibung...' },
      readMore: { en: 'More details...', sv: 'Mer detaljer...', de: 'Mehr Details...' },
      clue: { en: 'A riddle...', sv: 'En gåta...', de: 'Ein Rätsel...' },
      coordinates: { lat: 57.638, lng: 18.294 },
      googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=57.638,18.294',
      images: [],
      scanCount: 0,
    };

    try {
      await addLocation(newLoc);
      setEditingId(id);
      toast({
        title: 'Location created',
        description: 'The new location was added and is ready to edit.',
      });
    } catch (error) {
      toast({
        title: 'Create failed',
        description: error instanceof Error ? error.message : 'Could not create this location.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveLocation = async () => {
    if (!editingLoc || !draftLocation) return;

    const nextLat = Number.parseFloat(latInput.replace(',', '.'));
    const nextLng = Number.parseFloat(lngInput.replace(',', '.'));

    if (!Number.isFinite(nextLat) || !Number.isFinite(nextLng)) {
      toast({
        title: 'Invalid coordinates',
        description: 'Use decimal latitude/longitude values, for example 57.634437 and 18.280241.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const nextLocation: LocationData = {
        ...draftLocation,
        coordinates: {
          lat: nextLat,
          lng: nextLng,
        },
      };

      await updateLocation(editingLoc.id, nextLocation);
      toast({
        title: 'Location saved',
        description: `${nextLocation.name[language] || nextLocation.id} was updated.`,
      });
      setEditingId(null);
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Could not save this location.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLocation = async () => {
    if (!deleteTarget) return;

    setIsDeleting(deleteTarget.id);
    try {
      await removeLocation(deleteTarget.id);
      toast({
        title: 'Location deleted',
        description: `${deleteTarget.name[language] || deleteTarget.id} was removed.`,
      });
      if (editingId === deleteTarget.id) {
        setEditingId(null);
      }
      setDeleteTarget(null);
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Could not delete this location.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 pb-24">
      <h1 className="font-heading text-3xl text-medieval-gold medieval-shadow mb-8">
        {t('adminTitle', language)}
      </h1>

      <Tabs defaultValue="locations">
        <TabsList className="parchment-bg stone-border w-full">
          <TabsTrigger value="locations" className="flex-1 font-heading data-[state=active]:text-medieval-gold">
            {t('locations', language)}
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex-1 font-heading data-[state=active]:text-medieval-gold">
            {t('statistics', language)}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="mt-6">
          {editingLoc && draftLocation ? (
            <div className="parchment-bg stone-border rounded-lg p-6 space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h3 className="font-heading text-xl text-foreground">{t('editLocation', language)}</h3>
                <div className="flex gap-1">
                  {(['en', 'sv', 'de'] as Language[]).map((lang) => (
                    <Button
                      key={lang}
                      size="sm"
                      variant={editLang === lang ? 'default' : 'ghost'}
                      onClick={() => setEditLang(lang)}
                      className={editLang === lang ? 'bg-medieval-gold text-medieval-brown' : ''}
                    >
                      {lang.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="font-body">Location ID</Label>
                  <Input value={draftLocation.id} disabled className="bg-background/40 font-mono text-sm" />
                </div>
                <div>
                  <Label className="font-body">QR code value</Label>
                  <div className="flex gap-2">
                    <Input
                      value={draftLocation.qrCode}
                      onChange={(e) => updateDraft((current) => ({ ...current, qrCode: e.target.value }))}
                      className="bg-background/50 font-body"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        await navigator.clipboard.writeText(draftLocation.qrCode);
                        toast({ title: 'QR code copied', description: draftLocation.qrCode });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label className="font-body">{t('locationName', language)}</Label>
                <Input
                  value={draftLocation.name[editLang]}
                  onChange={(e) => updateDraft((current) => ({
                    ...current,
                    name: { ...current.name, [editLang]: e.target.value },
                  }))}
                  className="bg-background/50 font-body"
                />
              </div>

              <div>
                <Label className="font-body">Clue / riddle</Label>
                <Textarea
                  value={draftLocation.clue[editLang]}
                  onChange={(e) => updateDraft((current) => ({
                    ...current,
                    clue: { ...current.clue, [editLang]: e.target.value },
                  }))}
                  className="bg-background/50 font-body min-h-[90px]"
                />
              </div>

              <div>
                <Label className="font-body">{t('description', language)}</Label>
                <Textarea
                  value={draftLocation.description[editLang]}
                  onChange={(e) => updateDraft((current) => ({
                    ...current,
                    description: { ...current.description, [editLang]: e.target.value },
                  }))}
                  className="bg-background/50 font-body min-h-[100px]"
                />
              </div>

              <div>
                <Label className="font-body">{t('readMoreContent', language)}</Label>
                <Textarea
                  value={draftLocation.readMore[editLang]}
                  onChange={(e) => updateDraft((current) => ({
                    ...current,
                    readMore: { ...current.readMore, [editLang]: e.target.value },
                  }))}
                  className="bg-background/50 font-body min-h-[120px]"
                />
              </div>

              <div>
                <Label className="font-body">Coordinates</Label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label className="font-body text-xs text-muted-foreground">Latitude</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={latInput}
                      onChange={(e) => setLatInput(e.target.value)}
                      className="bg-background/50 font-body font-mono"
                    />
                  </div>
                  <div>
                    <Label className="font-body text-xs text-muted-foreground">Longitude</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={lngInput}
                      onChange={(e) => setLngInput(e.target.value)}
                      className="bg-background/50 font-body font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="font-body">Google Maps link</Label>
                <Input
                  value={draftLocation.googleMapsUrl}
                  onChange={(e) => updateDraft((current) => ({ ...current, googleMapsUrl: e.target.value }))}
                  className="bg-background/50 font-body"
                />
              </div>

              <div>
                <Label className="font-body">{t('images', language)}</Label>
                <Textarea
                  value={draftLocation.images.join('\n')}
                  onChange={(e) => updateDraft((current) => ({
                    ...current,
                    images: e.target.value
                      .split('\n')
                      .map((entry) => entry.trim())
                      .filter(Boolean),
                  }))}
                  className="bg-background/50 font-body min-h-[100px]"
                  placeholder="One image URL per line"
                />
                {draftLocation.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-3 md:grid-cols-4">
                    {draftLocation.images.map((img, i) => (
                      <div key={`${img}-${i}`} className="aspect-square rounded stone-border overflow-hidden bg-muted">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border/60 bg-background/30 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPinned className="w-4 h-4 text-medieval-gold" />
                  Scan count is managed by the live game and updates from player scans.
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => void handleSaveLocation()}
                  disabled={isSaving}
                  className="bg-medieval-gold text-medieval-brown hover:bg-medieval-gold/90 font-heading"
                >
                  {isSaving ? 'Saving...' : t('save', language)}
                </Button>
                <Button variant="ghost" onClick={() => setEditingId(null)} className="font-heading">
                  {t('cancel', language)}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  className="parchment-bg stone-border rounded-lg p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-heading text-foreground">{loc.name[language]}</h3>
                    <p className="font-body text-xs text-muted-foreground">QR: {loc.qrCode}</p>
                    <p className="font-body text-xs text-muted-foreground">
                      {loc.coordinates.lat.toFixed(4)}, {loc.coordinates.lng.toFixed(4)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(loc.id)}>
                      <Edit className="w-4 h-4 text-medieval-gold" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(loc)}>
                      <Trash2 className="w-4 h-4 text-medieval-crimson" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                onClick={() => void handleAddLocation()}
                variant="outline"
                className="w-full font-heading border-medieval-gold/30 text-medieval-gold"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('addLocation', language)}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <div className="grid gap-3 md:grid-cols-3 mb-4">
            <div className="parchment-bg stone-border rounded-lg p-4">
              <p className="font-body text-xs uppercase tracking-wide text-muted-foreground">{t('locations', language)}</p>
              <p className="font-heading text-2xl text-medieval-gold">{locations.length}</p>
            </div>
            <div className="parchment-bg stone-border rounded-lg p-4">
              <p className="font-body text-xs uppercase tracking-wide text-muted-foreground">{t('totalScans', language)}</p>
              <p className="font-heading text-2xl text-medieval-gold">{totalScans}</p>
            </div>
            <div className="parchment-bg stone-border rounded-lg p-4">
              <p className="font-body text-xs uppercase tracking-wide text-muted-foreground">Top location</p>
              <p className="font-heading text-base text-medieval-gold">
                {mostScanned ? mostScanned.name[language] : 'No scans yet'}
              </p>
              <p className="font-body text-xs text-muted-foreground">
                {mostScanned ? `${mostScanned.scanCount} total scans` : 'Waiting for first scan'}
              </p>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-end">
            <Button type="button" variant="outline" onClick={() => window.location.reload()} className="font-heading">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh stats
            </Button>
          </div>

          <div className="space-y-3">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="parchment-bg stone-border rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-heading text-sm text-foreground">{loc.name[language]}</h3>
                  <p className="font-body text-xs text-muted-foreground">{loc.qrCode}</p>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-medieval-gold" />
                  <span className="font-heading text-medieval-gold">{loc.scanCount}</span>
                  <span className="font-body text-xs text-muted-foreground">{t('totalScans', language)}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete location?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This will permanently remove ${deleteTarget.name[language] || deleteTarget.id} from the game.`
                : 'This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(isDeleting)}>{t('cancel', language)}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteLocation();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
