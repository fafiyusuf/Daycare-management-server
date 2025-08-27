"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/crd"
import { BackendChild, useChildStore } from "@/lib/store/childStore"
import { ArrowLeft, Baby, Calendar, Heart, Home, Loader2, Phone, Shield, User } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"

const getAge = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateString);

    if (isNaN(birthDate.getTime())) {
        return 'Invalid Date';
    }

    let ageYears = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        ageYears--;
    }

    let ageMonths = (today.getMonth() - birthDate.getMonth() + 12) % 12;
    if (today.getDate() < birthDate.getDate()) {
        ageMonths = (ageMonths - 1 + 12) % 12;
    }

    if (ageYears > 0) {
        return `${ageYears} year${ageYears > 1 ? 's' : ''}, ${ageMonths} month${ageMonths !== 1 ? 's' : ''}`;
    }
    return `${ageMonths} month${ageMonths !== 1 ? 's' : ''}`;
};

const InfoItem = ({ icon, label, value }: { icon: ReactNode, label: string, value: ReactNode }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 w-8 text-muted-foreground">{icon}</div>
        <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-base font-semibold">{value || 'N/A'}</p>
        </div>
    </div>
);

export default function ChildProfilePage() {
    const params = useParams()
    const childId = params.id

    const { fetchChildById, isChildrenLoading } = useChildStore()
    const [child, setChild] = useState<BackendChild | null>(null)

    useEffect(() => {
        const loadData = async () => {
            if (childId) {
                try {
                    const fetchedChild = await fetchChildById(Number(childId));
                    setChild(fetchedChild);
                } catch (error) {
                    console.error("Failed to fetch child data:", error);
                }
            }
        };
        loadData();
    }, [childId, fetchChildById]);

    if (isChildrenLoading || !child) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    const { parents: parentList } = child as any;

    // Support both legacy primitive id and new nested object for family
    const rawFamily: any = (child as any).family;
    const familyName = rawFamily && typeof rawFamily === 'object' ? rawFamily.name : '';

    // Support both numeric id and nested object for babysitter
    const rawBabysitter: any = (child as any).assigned_babysitter;
    const babysitterName = rawBabysitter
        ? (typeof rawBabysitter === 'object'
            ? `${rawBabysitter.first_name || ''} ${rawBabysitter.last_name || ''}`.trim()
            : 'Assigned')
        : '';

    // Medical / Allergies with safe fallbacks (empty string -> friendly text)
    const medicalInfo = (child as any).medical_info && (child as any).medical_info.trim().length > 0
        ? (child as any).medical_info
        : 'No medical information provided.';
    const allergiesInfo = (child as any).allergies && (child as any).allergies.trim().length > 0
        ? (child as any).allergies
        : 'No known allergies.';

    const parents = parentList && parentList.length > 0 
        ? parentList.map((p: any) => `${p.first_name} ${p.last_name}`).join(', ') 
        : 'N/A';

    return (
        <div className="min-h-screen bg-muted/40">
            <div className="container mx-auto p-4 md:p-8">
                <div className="mb-6">
                    <Button asChild variant="outline" className="mb-4">
                        <Link href="/admin">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Child List
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Child Profile</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-8">
                        <Card className="overflow-hidden">
                            <CardHeader className="bg-muted/20 flex flex-col items-center text-center p-6">
                                <Avatar className="h-24 w-24 mb-4 border-4 border-background">
                                    <AvatarImage src={child.profile_picture || `/avatars/child.png`} alt={`${child.first_name} ${child.last_name}`} />
                                    <AvatarFallback className="text-3xl">
                                        {child.first_name.charAt(0)}{child.last_name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle className="text-2xl">{`${child.first_name} ${child.last_name}`}</CardTitle>
                                <CardDescription>{getAge(child.date_of_birth)}</CardDescription>
                                {child.is_active ? (
                                    <Badge variant="default" className="mt-2">Active</Badge>
                                ) : (
                                    <Badge variant="outline" className="mt-2 bg-red-100 text-red-700 border-red-300">Inactive</Badge>
                                )}
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <InfoItem icon={<Calendar className="h-5 w-5" />} label="Date of Birth" value={new Date(child.date_of_birth).toLocaleDateString()} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Family & Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <InfoItem icon={<User className="h-5 w-5" />} label="Parents" value={parents} />
                                <InfoItem icon={<Home className="h-5 w-5" />} label="Family" value={familyName} />
                                <InfoItem icon={<Phone className="h-5 w-5" />} label="Emergency Contact" value={child.emergency_contact} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Health Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <InfoItem icon={<Heart className="h-5 w-5" />} label="Medical Notes" value={medicalInfo} />
                                <InfoItem icon={<Shield className="h-5 w-5" />} label="Allergies" value={allergiesInfo} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Daycare Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <InfoItem icon={<Baby className="h-5 w-5" />} label="Assigned Babysitter" value={babysitterName || 'N/A'} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
