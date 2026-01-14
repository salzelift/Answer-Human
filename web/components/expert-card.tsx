'use client';

import React from "react";
import { KnowledgeProvider } from "@/types/expert.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MapPin, Briefcase, GraduationCap, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ExpertCardProps {
  expert: KnowledgeProvider;
}

export default function ExpertCard({ expert }: ExpertCardProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <>
      {/* CARD */}
      <Card
        onClick={() => setIsDialogOpen(true)}
        className="
          group cursor-pointer
          transition-all duration-200
          hover:shadow-lg
          min-w-[260px]
          max-w-full
          h-full
          flex flex-col
        "
      >
        {/* BANNER */}
        <div className="relative h-32 w-full overflow-hidden">
          {expert.bannerPictureUrl ? (
            <Image
              src={expert.bannerPictureUrl}
              alt={`${expert.name} banner`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-blue-400 to-purple-500" />
          )}
        </div>

        {/* HEADER */}
        <CardHeader className="pb-3">
          <div className="flex gap-3 items-start">
            <Avatar className="h-14 w-14 shrink-0 border-2 border-white -mt-8 shadow-md">
              <AvatarImage src={expert.profilePictureUrl || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                {getInitials(expert.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 overflow-hidden">
              <CardTitle className="text-base font-semibold truncate">
                {expert.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 text-xs mt-1 truncate">
                <Briefcase className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {expert.jobTitle || expert.company || "Expert"}
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="space-y-3 text-sm text-gray-600 flex-1">
          <p className="line-clamp-2">
            {expert.description || expert.bio || "Expert in their field"}
          </p>

          <div className="flex items-center justify-between text-xs">
            {expert.location && (
              <div className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{expert.location}</span>
              </div>
            )}

            {expert.isAvailable && (
              <div className="flex items-center gap-1 text-green-600 shrink-0">
                <Clock className="h-3 w-3" />
                <span>Available</span>
              </div>
            )}
          </div>

          {expert.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {expert.skills.slice(0, 3).map((skill, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {expert.skills.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{expert.skills.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        {/* FOOTER */}
        <CardFooter>
          <Button
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              setIsDialogOpen(true);
            }}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>

      {/* DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 border-2 border-gray-200">
                <AvatarImage src={expert.profilePictureUrl || undefined} alt={expert.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-lg">
                  {getInitials(expert.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <DialogTitle className="text-2xl">{expert.name}</DialogTitle>
                <DialogDescription className="mt-2 text-sm text-muted-foreground">
                  Expert Profile Details
                </DialogDescription>
                <div className="mt-2 space-y-1">
                  {expert.jobTitle && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4" />
                      <span>{expert.jobTitle}</span>
                      {expert.company && <span>at {expert.company}</span>}
                    </div>
                  )}
                  {expert.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{expert.location}</span>
                    </div>
                  )}
                  {expert.education && (
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4" />
                      <span>{expert.education}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {expert.description && (
              <div>
                <h4 className="font-semibold mb-2">About</h4>
                <p className="text-sm text-gray-600">{expert.description}</p>
              </div>
            )}

            {expert.bio && (
              <div>
                <h4 className="font-semibold mb-2">Bio</h4>
                <p className="text-sm text-gray-600">{expert.bio}</p>
              </div>
            )}

            {expert.skills && expert.skills.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {expert.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {expert.availableLanguages && expert.availableLanguages.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {expert.availableLanguages.map((lang, index) => (
                    <Badge key={index} variant="outline">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <p className="text-sm font-medium text-gray-500">Availability</p>
                <p className="text-sm text-gray-900">
                  {expert.isAvailable ? 'Available' : 'Not Available'}
                </p>
              </div>
              {expert.availableDays && expert.availableDays.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Available Days</p>
                  <p className="text-sm text-gray-900">
                    {expert.availableDays.length} days/week
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => router.push(`/expert/${expert.id}`)}
            >
              Show More
            </Button>
            <Button
              onClick={() => router.push(`/expert/${expert.id}/book`)}
            >
              Book Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
